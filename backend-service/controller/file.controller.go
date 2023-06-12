package controller

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"os"
	"os/exec"
	"path"
	"strconv"
	"time"

	model "github.com/coderRCAman/models"
	"github.com/coderRCAman/utility"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type NfswRes struct {
	Status bool `json:"status"`
}

func newMongoFileObject(fiberCtx *fiber.Ctx, file *multipart.FileHeader, user_id primitive.ObjectID, fileType string, filename string) (*model.File, error) {
	title := fiberCtx.FormValue("title")
	description := fiberCtx.FormValue("description")
	height, _ := strconv.ParseInt(fiberCtx.FormValue("height"), 10, 32)
	width, _ := strconv.ParseInt(fiberCtx.FormValue("width"), 10, 32)
	license := fiberCtx.FormValue("license")
	contentType := file.Header.Get("Content-Type")
	category, err := primitive.ObjectIDFromHex(fiberCtx.FormValue("category"))
	if err != nil {
		return nil, errors.New("category")
	}
	fmt.Println(filename)
	validate := validator.New()
	validate.RegisterValidation("licensetype", utility.LicenseTypeValidate)
	if fileType == "image" {
		if !utility.ImageTypeValidate(contentType) {
			return nil, errors.New("fileType")
		}
		newFile := model.File{
			Title:       title,
			Description: description,
			FileName:    filename,
			Height:      int32(height),
			Width:       int32(width),
			License:     license,
			Type:        "image",
			CreatedAt:   time.Now(),
			User:        user_id,
			Category:    category,
		}
		err = validate.Struct(newFile)
		fmt.Println(err)
		if err != nil {
			return nil, errors.New("validation")
		}
		newFile.SanitizeHtml()
		return &newFile, nil
	} else {
		if !utility.VideoTypeValidate(contentType) {
			return nil, errors.New("fileType")
		}
		newFile := model.File{
			Title:       title,
			Description: description,
			Height:      int32(height),
			Width:       int32(width),
			License:     license,
			Type:        "video",
			CreatedAt:   time.Now(),
			User:        user_id,
			Category:    category,
			FileName:    filename,
		}
		err = validate.Struct(newFile)
		fmt.Println(err)
		if err != nil {
			return nil, errors.New("validation")
		}

		newFile.SanitizeHtml()
		return &newFile, nil
	}
}

func (c *Controller) UploadImages(fiberCtx *fiber.Ctx) error {
	user_id, _ := primitive.ObjectIDFromHex(fiberCtx.Cookies("id"))
	file, err := fiberCtx.FormFile("file")
	uniqueFileName := utility.UniqueFileName(file.Filename)
	if err != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "missing image file!",
		})
	}
	var collResult *mongo.InsertOneResult
	newFile, err := newMongoFileObject(fiberCtx, file, user_id, "image", uniqueFileName)
	if err != nil {
		switch err.Error() {
		case "missingType":
			return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"msg": "Missing file type!",
			})
		case "validation":
			return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"msg": "Failed to validate or missing some fields re-check fields!",
			})
		case "fileType":
			return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"msg": "Invalid file type",
			})
		case "category":
			return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"msg": "Missing category",
			})
		}

	}

	tempDir, dirErr := ioutil.TempDir("./../", "temp-images")
	defer os.RemoveAll(tempDir)
	if dirErr != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(dirErr)
	}

	err = fiberCtx.SaveFile(file, fmt.Sprintf("%s/%s", tempDir, file.Filename))
	if err != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "unable to save file something went wrong!",
		})
	}
	url := "http://localhost:5000/api/nsfw/image/"
	body := map[string]string{
		"file_name": file.Filename,
		"file_path": tempDir,
	}
	jsonValue, _ := json.Marshal(body)
	resBody := new(NfswRes)
	res, err := http.Post(url, "application/json", bytes.NewBuffer(jsonValue))
	if err != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Couldnot process nsfw too many active requests!",
		})
	}
	err = json.NewDecoder(res.Body).Decode(&resBody)
	if err != nil || res.StatusCode == 500 {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "error while verifying nsfw contents!",
		})
	}
	if !resBody.Status {
		return fiberCtx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"msg": "This image contains vulgar explicit contents cannot proceed!",
		})
	}
	defer res.Body.Close()
	//main saving and watermark section
	//private footage
	if newFile.License == "f2u" {
		err = fiberCtx.SaveFile(file, fmt.Sprintf("./../storage/images/public/public_%s", uniqueFileName))
		if err != nil {
			return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"msg": "unable to save file something went wrong!",
			})
		}
		public_url := fmt.Sprintf("http://localhost:4269/api/public/public_%s", uniqueFileName)
		private_url := fmt.Sprintf("http://localhost:4269/api/free/image/public_%s", uniqueFileName)
		//since it is a f2u license it doesnt have to into the private dir
		newFile.PrivateUrl = private_url
		newFile.PublicUrl = public_url
		newFile.FileName = uniqueFileName
		coll := c.DB.Database("test").Collection("file")
		result, err := coll.InsertOne(context.TODO(), newFile)
		collResult = result
		if err != nil {
			return fiberCtx.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"msg": "Failed to save content in out Database!",
			})
		}
		update := bson.D{{
			Key: "$addToSet",
			Value: bson.D{{
				Key:   "uploads",
				Value: result.InsertedID,
			}},
		}}
		coll = c.DB.Database("test").Collection("user")
		coll.FindOneAndUpdate(context.TODO(), bson.D{{Key: "_id", Value: user_id}}, update)

	} else {

		err = fiberCtx.SaveFile(file, fmt.Sprintf("./../storage/images/private/%s", uniqueFileName))
		if err != nil {
			return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"msg": "unable to save file something went wrong!",
			})
		}

		mainImage := fmt.Sprintf("./../storage/images/private/%s", uniqueFileName)
		overlayImage := "./../storage/watermark/STOCK_FOOTAGE-removebg-preview.png"
		outputPath := fmt.Sprintf("./../storage/images/public/public_%s", uniqueFileName)
		cmd := exec.Command("ffmpeg", "-i", mainImage, "-i", overlayImage, "-filter_complex", "overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:shortest=1", outputPath)
		err = cmd.Run()
		if err != nil {
			return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"msg": "unable to save file something went wrong!",
			})
		}
		private_url := fmt.Sprintf("http://localhost:4269/api/private/%s", uniqueFileName)
		public_url := fmt.Sprintf("http://localhost:4269/api/public/public_%s", uniqueFileName)
		newFile.PrivateUrl = private_url
		newFile.PublicUrl = public_url
		newFile.FileName = uniqueFileName
		coll := c.DB.Database("test").Collection("file")
		result, err := coll.InsertOne(context.TODO(), newFile)
		collResult = result
		if err != nil {
			return fiberCtx.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"msg": "Failed to save content in our Database!",
			})
		}
		coll = c.DB.Database("test").Collection("user")
		update := bson.D{{
			Key: "$addToSet",
			Value: bson.D{{
				Key: "uploads", Value: result.InsertedID,
			}},
		}}
		ressss := coll.FindOneAndUpdate(context.TODO(), bson.D{{Key: "_id", Value: user_id}}, update)
		if ressss.Err() != nil {
			fmt.Println(ressss.Err().Error())
		}
	}

	return fiberCtx.JSON(collResult)
}

func (c *Controller) UploadVideos(fiberCtx *fiber.Ctx) error {
	user_id, _ := primitive.ObjectIDFromHex(fiberCtx.Cookies("id"))
	file, err := fiberCtx.FormFile("file")
	if err != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "missing video file!",
		})
	}

	uniqueFileName := utility.UniqueFileName(file.Filename)
	var collResult *mongo.InsertOneResult
	newFile, err := newMongoFileObject(fiberCtx, file, user_id, "video", uniqueFileName)
	if err != nil {
		switch err.Error() {
		case "missingType":
			return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"msg": "Missing file type!",
			})
		case "validation":
			return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"msg": "Failed to validate or missing some fields re-check fields!",
			})
		case "fileType":
			return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"msg": "Invalid file type",
			})
		case "category":
			return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"msg": "Missing category",
			})
		}
	}

	if err != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Unable to verify nsfw contents",
		})
	}

	tempDir, dirErr := ioutil.TempDir("./../", "temp-video")
	defer os.RemoveAll(tempDir)
	if dirErr != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(dirErr)
	}
	err = fiberCtx.SaveFile(file, fmt.Sprintf("%s/%s", tempDir, uniqueFileName))
	if err != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Unable to load video file to server!",
		})
	}
	videoPath := path.Join(tempDir, uniqueFileName)
	tempOutPath := path.Join(tempDir, "video%03d.bmp")
	cmd := exec.Command("ffmpeg", "-i", videoPath, "-r", "1/1", tempOutPath)
	err = cmd.Run()
	if err != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Unable to parse video file for nsfw content",
		})
	}
	//verify for nsfw content
	url := "http://localhost:5000/api/nsfw/video/"
	body := map[string]string{
		"file_name": uniqueFileName,
		"file_path": tempDir,
	}
	jsonValue, _ := json.Marshal(body)
	resBody := new(NfswRes)
	res, err := http.Post(url, "application/json", bytes.NewBuffer(jsonValue))
	if err != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Couldnot process nsfw too many active requests!",
		})
	}
	err = json.NewDecoder(res.Body).Decode(&resBody)
	if err != nil || res.StatusCode == 500 {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "error while verifying nsfw contents!",
		})
	}
	if !resBody.Status {
		return fiberCtx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"msg": "This video contains vulgar explicit contents cannot proceed!",
		})
	}
	defer res.Body.Close()

	if newFile.License == "f2u" {
		err = fiberCtx.SaveFile(file, fmt.Sprintf("./../storage/videos/public/public_%s", uniqueFileName))
		if err != nil {
			return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"msg": "unable to save file something went wrong!",
			})
		}
		public_url := fmt.Sprintf("http://localhost:4269/api/footage/public/public_%s", uniqueFileName)
		private_url := fmt.Sprintf("http://localhost:4269/api/free/footage/public_%s", uniqueFileName)
		//since it is a f2u license it doesnt have to into the private dir
		newFile.PrivateUrl = private_url
		newFile.PublicUrl = public_url
		newFile.FileName = uniqueFileName
		coll := c.DB.Database("test").Collection("file")
		result, err := coll.InsertOne(context.TODO(), newFile)
		collResult = result
		if err != nil {
			return fiberCtx.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"msg": "Failed to save content in out Database!",
			})
		}
		update := bson.D{{
			Key: "$addToSet",
			Value: bson.D{{
				Key: "uploads", Value: result.InsertedID,
			}},
		}}
		coll = c.DB.Database("test").Collection("user")
		coll.FindOneAndUpdate(context.TODO(), bson.D{{Key: "_id", Value: user_id}}, update)
	} else {
		err = fiberCtx.SaveFile(file, fmt.Sprintf("./../storage/videos/private/%s", uniqueFileName))
		if err != nil {
			return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"msg": "unable to save file something went wrong!",
			})
		}
		mainVideo := fmt.Sprintf("./../storage/videos/private/%s", uniqueFileName)
		overlayImage := "./../storage/watermark/STOCK_FOOTAGE-removebg-preview.png"
		outputPath := fmt.Sprintf("./../storage/videos/public/public_%s", uniqueFileName)
		cmd := exec.Command("ffmpeg", "-i", mainVideo, "-i", overlayImage, "-filter_complex", "overlay=(W-w)/2:(H-h)/2", outputPath)
		err := cmd.Run()
		if err != nil {
			return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"msg": "While parsing the file encountered an error!",
			})
		}
		public_url := fmt.Sprintf("http://localhost:4269/api/footage/public/public_%s", uniqueFileName)
		private_url := fmt.Sprintf("http://localhost:4269/api/footage/private/%s", uniqueFileName)
		newFile.FileName = uniqueFileName
		newFile.PublicUrl = public_url
		newFile.PrivateUrl = private_url
		coll := c.DB.Database("test").Collection("file")
		result, err := coll.InsertOne(context.TODO(), newFile)
		collResult = result
		if err != nil {
			return fiberCtx.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"msg": "Failed to save content in out Database!",
			})
		}
		update := bson.D{{
			Key: "$addToSet",
			Value: bson.D{{
				Key: "uploads", Value: result.InsertedID,
			}},
		}}
		coll = c.DB.Database("test").Collection("user")
		coll.FindOneAndUpdate(context.TODO(), bson.D{{Key: "_id", Value: user_id}}, update)

	}
	return fiberCtx.JSON(collResult)
}

func (c *Controller) GetFileById(fiberCtx *fiber.Ctx) error {
	id, _ := primitive.ObjectIDFromHex(fiberCtx.Params("id"))
	coll := c.DB.Database("test").Collection("file")
	filterStage := bson.D{{
		Key: "$match",
		Value: bson.D{{
			Key:   "_id",
			Value: id,
		}},
	}}
	populateStage := bson.D{{
		Key: "$lookup",
		Value: bson.D{
			{
				Key:   "from",
				Value: "user",
			},
			{
				Key:   "localField",
				Value: "user",
			},
			{
				Key:   "foreignField",
				Value: "_id",
			},
			{
				Key:   "as",
				Value: "user",
			},
		},
	}}
	var result []bson.M
	opts := options.Aggregate().SetMaxTime(2 * time.Second)
	cursor, err := coll.Aggregate(context.TODO(), mongo.Pipeline{filterStage, populateStage}, opts)
	if err != nil {
		fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to load the file!",
		})
	}
	if err := cursor.All(context.TODO(), &result); err != nil {
		fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to load the file!",
		})
	}
	return fiberCtx.JSON(result)
}

func (c *Controller) GetFilesByCategoryImages(fiberCtx *fiber.Ctx) error {

	id, _ := primitive.ObjectIDFromHex(fiberCtx.Params("id"))
	coll := c.DB.Database("test").Collection("file")
	page, _ := strconv.Atoi(fiberCtx.Query("page"))
	limit, _ := strconv.Atoi(fiberCtx.Query("limit"))
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	fmt.Println(limit, page)
	populateStage := bson.D{{
		Key: "$lookup",
		Value: bson.D{
			{
				Key:   "from",
				Value: "user",
			},
			{
				Key:   "localField",
				Value: "user",
			},
			{
				Key:   "foreignField",
				Value: "_id",
			},
			{
				Key: "pipeline",
				Value: bson.A{
					bson.D{
						{
							Key: "$project",
							Value: bson.D{
								{
									Key:   "name",
									Value: 1,
								},
								{
									Key:   "email",
									Value: 1,
								},
								{
									Key:   "avatar",
									Value: 1,
								},
								{
									Key:   "_id",
									Value: 0,
								},
							},
						},
					},
				},
			},
			{
				Key:   "as",
				Value: "user",
			},
		},
	}}
	categoryPopulateStage := bson.D{{
		Key: "$lookup",
		Value: bson.D{
			{
				Key:   "from",
				Value: "category",
			},
			{
				Key:   "localField",
				Value: "category",
			},
			{
				Key:   "foreignField",
				Value: "_id",
			},
			{
				Key:   "as",
				Value: "category",
			},
		},
	}}
	filterStage := bson.D{{
		Key: "$facet",
		Value: bson.D{
			{
				Key: "results",
				Value: bson.A{
					bson.D{
						{
							Key: "$match",
							Value: bson.D{{
								Key: "$and",
								Value: bson.A{
									bson.D{{
										Key:   "category",
										Value: id,
									}},
									bson.D{{
										Key:   "type",
										Value: "image",
									}},
								},
							}},
						},
					},
					bson.D{
						{
							Key:   "$skip",
							Value: (page - 1) * limit,
						},
					},
					bson.D{
						{
							Key:   "$limit",
							Value: limit,
						},
					},
					bson.D{
						{
							Key: "$sort",
							Value: bson.D{{
								Key:   "createdAt",
								Value: 1,
							}},
						},
					},
					populateStage,
					categoryPopulateStage,
				},
			},
			{
				Key: "count",
				Value: bson.A{
					bson.D{
						{
							Key: "$match",
							Value: bson.D{{
								Key: "$and",
								Value: bson.A{
									bson.D{{
										Key:   "category",
										Value: id,
									}},
									bson.D{{
										Key:   "type",
										Value: "image",
									}},
								},
							}},
						},
					},
				},
			},
		},
	}}
	projectStage := bson.D{{
		Key: "$project",
		Value: bson.D{
			{
				Key:   "results",
				Value: 1,
			},
			{
				Key: "count",
				Value: bson.D{{
					Key:   "$size",
					Value: "$count",
				}},
			},
		},
	}}
	addExtraFieldStage := bson.D{{
		Key: "$addFields",
		Value: bson.D{{
			Key:   "page",
			Value: page,
		}, {
			Key:   "limit",
			Value: limit,
		}},
	}}
	var result []bson.M
	opts := options.Aggregate().SetMaxTime(2 * time.Second)
	cursor, err := coll.Aggregate(context.TODO(), mongo.Pipeline{filterStage, projectStage, addExtraFieldStage}, opts)
	fmt.Println(err)
	if err != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to load data",
		})
	}
	if err := cursor.All(context.TODO(), &result); err != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to load data",
		})
	}
	return fiberCtx.JSON(result[0])
}
func (c *Controller) GetFilesByCategoryVideos(fiberCtx *fiber.Ctx) error {
	id, _ := primitive.ObjectIDFromHex(fiberCtx.Params("id"))
	coll := c.DB.Database("test").Collection("file")
	page, _ := strconv.Atoi(fiberCtx.Query("page"))
	limit, _ := strconv.Atoi(fiberCtx.Query("limit"))
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	fmt.Println(limit, page)
	populateStage := bson.D{{
		Key: "$lookup",
		Value: bson.D{
			{
				Key:   "from",
				Value: "user",
			},
			{
				Key:   "localField",
				Value: "user",
			},
			{
				Key:   "foreignField",
				Value: "_id",
			},
			{
				Key: "pipeline",
				Value: bson.A{
					bson.D{
						{
							Key: "$project",
							Value: bson.D{
								{
									Key:   "name",
									Value: 1,
								},
								{
									Key:   "email",
									Value: 1,
								},
								{
									Key:   "avatar",
									Value: 1,
								},
								{
									Key:   "_id",
									Value: 0,
								},
							},
						},
					},
				},
			},
			{
				Key:   "as",
				Value: "user",
			},
		},
	}}
	categoryPopulateStage := bson.D{{
		Key: "$lookup",
		Value: bson.D{
			{
				Key:   "from",
				Value: "category",
			},
			{
				Key:   "localField",
				Value: "category",
			},
			{
				Key:   "foreignField",
				Value: "_id",
			},
			{
				Key:   "as",
				Value: "category",
			},
		},
	}}
	filterStage := bson.D{{
		Key: "$facet",
		Value: bson.D{
			{
				Key: "results",
				Value: bson.A{
					bson.D{
						{
							Key: "$match",
							Value: bson.D{{
								Key: "$and",
								Value: bson.A{
									bson.D{{
										Key:   "category",
										Value: id,
									}},
									bson.D{{
										Key:   "type",
										Value: "video",
									}},
								},
							}},
						},
					},
					bson.D{
						{
							Key:   "$skip",
							Value: (page - 1) * limit,
						},
					},
					bson.D{
						{
							Key:   "$limit",
							Value: limit,
						},
					},
					bson.D{
						{
							Key: "$sort",
							Value: bson.D{{
								Key:   "createdAt",
								Value: 1,
							}},
						},
					},
					populateStage,
					categoryPopulateStage,
				},
			},
			{
				Key: "count",
				Value: bson.A{
					bson.D{
						{
							Key: "$match",
							Value: bson.D{{
								Key: "$and",
								Value: bson.A{
									bson.D{{
										Key:   "category",
										Value: id,
									}},
									bson.D{{
										Key:   "type",
										Value: "video",
									}},
								},
							}},
						},
					},
				},
			},
		},
	}}
	projectStage := bson.D{{
		Key: "$project",
		Value: bson.D{
			{
				Key:   "results",
				Value: 1,
			},
			{
				Key: "count",
				Value: bson.D{{
					Key:   "$size",
					Value: "$count",
				}},
			},
		},
	}}
	addExtraFieldStage := bson.D{{
		Key: "$addFields",
		Value: bson.D{{
			Key:   "page",
			Value: page,
		}, {
			Key:   "limit",
			Value: limit,
		}},
	}}
	var result []bson.M
	opts := options.Aggregate().SetMaxTime(2 * time.Second)
	cursor, err := coll.Aggregate(context.TODO(), mongo.Pipeline{filterStage, projectStage, addExtraFieldStage}, opts)
	fmt.Println(err)
	if err != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to load data",
		})
	}
	if err := cursor.All(context.TODO(), &result); err != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to load data",
		})
	}
	return fiberCtx.JSON(result[0])
}

func (c *Controller) SearchImage(fiberCtx *fiber.Ctx) error {
	search := fiberCtx.Query("search")
	fmt.Println(search)
	populateStage := bson.D{{
		Key: "$lookup",
		Value: bson.D{
			{
				Key:   "from",
				Value: "user",
			},
			{
				Key:   "localField",
				Value: "user",
			},
			{
				Key:   "foreignField",
				Value: "_id",
			},
			{
				Key: "pipeline",
				Value: bson.A{
					bson.D{
						{
							Key: "$project",
							Value: bson.D{
								{
									Key:   "name",
									Value: 1,
								},
								{
									Key:   "email",
									Value: 1,
								},
								{
									Key:   "avatar",
									Value: 1,
								},
								{
									Key:   "_id",
									Value: 0,
								},
							},
						},
					},
				},
			},
			{
				Key:   "as",
				Value: "user",
			},
		},
	}}
	categoryPopulateStage := bson.D{{
		Key: "$lookup",
		Value: bson.D{
			{
				Key:   "from",
				Value: "category",
			},
			{
				Key:   "localField",
				Value: "category",
			},
			{
				Key:   "foreignField",
				Value: "_id",
			},
			{
				Key:   "as",
				Value: "category",
			},
		},
	}}
	coll := c.DB.Database("test").Collection("category")
	var categoryResult model.Category
	coll.FindOne(context.TODO(), bson.D{{
		Key: "name",
		Value: bson.D{{
			Key:   "$regex",
			Value: ".*" + search + ".*",
		},
			{
				Key:   "$options",
				Value: "i",
			},
		},
	}}).Decode(&categoryResult)
	fmt.Println(categoryResult)
	coll = c.DB.Database("test").Collection("file")
	page, _ := strconv.Atoi(fiberCtx.Query("page"))
	limit, _ := strconv.Atoi(fiberCtx.Query("limit"))
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	filterStage := bson.D{{
		Key: "$facet",
		Value: bson.D{{
			Key: "results",
			Value: bson.A{
				bson.D{{
					Key: "$match",
					Value: bson.D{{
						Key: "$and",
						Value: bson.A{
							bson.D{
								{
									Key:   "type",
									Value: "image",
								},
							},
							bson.D{
								{
									Key: "$or",
									Value: bson.A{
										bson.D{{
											Key: "title",
											Value: bson.D{{
												Key:   "$regex",
												Value: ".*" + search + ".*",
											},
												{
													Key:   "$options",
													Value: "i",
												},
											},
										}},
										bson.D{{
											Key: "description",
											Value: bson.D{{
												Key:   "$regex",
												Value: ".*" + search + ".*",
											},
												{
													Key:   "$options",
													Value: "i",
												},
											},
										}},
										bson.D{{
											Key:   "category",
											Value: categoryResult.Id,
										}},
									},
								},
							},
						},
					}},
				},
				},
				bson.D{
					{
						Key:   "$skip",
						Value: (page - 1) * limit,
					},
				},
				bson.D{
					{
						Key:   "$limit",
						Value: limit,
					},
				},
				bson.D{
					{
						Key: "$sort",
						Value: bson.D{{
							Key:   "createdAt",
							Value: 1,
						}},
					},
				},
				populateStage,
				categoryPopulateStage,
			},
		},
			{
				Key: "count",
				Value: bson.A{
					bson.D{{
						Key: "$match",
						Value: bson.D{{
							Key: "$and",
							Value: bson.A{
								bson.D{
									{
										Key:   "type",
										Value: "image",
									},
								},
								bson.D{
									{
										Key: "$or",
										Value: bson.A{
											bson.D{{
												Key: "title",
												Value: bson.D{{
													Key:   "$regex",
													Value: ".*" + search + ".*",
												},
													{
														Key:   "$options",
														Value: "i",
													},
												},
											}},
											bson.D{{
												Key: "description",
												Value: bson.D{{
													Key:   "$regex",
													Value: ".*" + search + ".*",
												},
													{
														Key:   "$options",
														Value: "i",
													},
												},
											}},
											bson.D{{
												Key:   "category",
												Value: categoryResult.Id,
											}},
										},
									},
								},
							},
						}},
					},
					},
				},
			},
		},
	},
	}
	projectStage := bson.D{{
		Key: "$project",
		Value: bson.D{
			{
				Key:   "results",
				Value: 1,
			},
			{
				Key: "count",
				Value: bson.D{{
					Key:   "$size",
					Value: "$count",
				}},
			},
		},
	}}
	addExtraFieldStage := bson.D{{
		Key: "$addFields",
		Value: bson.D{{
			Key:   "page",
			Value: page,
		}, {
			Key:   "limit",
			Value: limit,
		}},
	}}
	var result []bson.M
	opts := options.Aggregate().SetMaxTime(2 * time.Second)
	cursor, err := coll.Aggregate(context.TODO(), mongo.Pipeline{filterStage, projectStage, addExtraFieldStage}, opts)
	fmt.Println(err)
	if err != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to load data",
		})
	}
	if err := cursor.All(context.TODO(), &result); err != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to load data",
		})
	}
	return fiberCtx.JSON(result[0])
}
func (c *Controller) SearchVideo(fiberCtx *fiber.Ctx) error {
	search := fiberCtx.Query("search")
	populateStage := bson.D{{
		Key: "$lookup",
		Value: bson.D{
			{
				Key:   "from",
				Value: "user",
			},
			{
				Key:   "localField",
				Value: "user",
			},
			{
				Key:   "foreignField",
				Value: "_id",
			},
			{
				Key: "pipeline",
				Value: bson.A{
					bson.D{
						{
							Key: "$project",
							Value: bson.D{
								{
									Key:   "name",
									Value: 1,
								},
								{
									Key:   "email",
									Value: 1,
								},
								{
									Key:   "avatar",
									Value: 1,
								},
								{
									Key:   "_id",
									Value: 0,
								},
							},
						},
					},
				},
			},
			{
				Key:   "as",
				Value: "user",
			},
		},
	}}
	categoryPopulateStage := bson.D{{
		Key: "$lookup",
		Value: bson.D{
			{
				Key:   "from",
				Value: "category",
			},
			{
				Key:   "localField",
				Value: "category",
			},
			{
				Key:   "foreignField",
				Value: "_id",
			},
			{
				Key:   "as",
				Value: "category",
			},
		},
	}}
	coll := c.DB.Database("test").Collection("category")
	var categoryResult model.Category
	coll.FindOne(context.TODO(), bson.D{{
		Key: "name",
		Value: bson.D{{
			Key:   "$regex",
			Value: ".*" + search + ".*",
		},
			{
				Key:   "$options",
				Value: "i",
			},
		},
	}}).Decode(&categoryResult)
	coll = c.DB.Database("test").Collection("file")
	page, _ := strconv.Atoi(fiberCtx.Query("page"))
	limit, _ := strconv.Atoi(fiberCtx.Query("limit"))
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	filterStage := bson.D{{
		Key: "$facet",
		Value: bson.D{{
			Key: "results",
			Value: bson.A{
				bson.D{{
					Key: "$match",
					Value: bson.D{{
						Key: "$and",
						Value: bson.A{
							bson.D{
								{
									Key:   "type",
									Value: "video",
								},
							},
							bson.D{
								{
									Key: "$or",
									Value: bson.A{
										bson.D{{
											Key: "title",
											Value: bson.D{{
												Key:   "$regex",
												Value: ".*" + search + ".*",
											},
												{
													Key:   "$options",
													Value: "i",
												},
											},
										}},
										bson.D{{
											Key: "description",
											Value: bson.D{{
												Key:   "$regex",
												Value: ".*" + search + ".*",
											},
												{
													Key:   "$options",
													Value: "i",
												},
											},
										}},
										bson.D{{
											Key:   "category",
											Value: categoryResult.Id,
										}},
									},
								},
							},
						},
					}},
				},
				},
				bson.D{
					{
						Key:   "$skip",
						Value: (page - 1) * limit,
					},
				},
				bson.D{
					{
						Key:   "$limit",
						Value: limit,
					},
				},
				bson.D{
					{
						Key: "$sort",
						Value: bson.D{{
							Key:   "createdAt",
							Value: 1,
						}},
					},
				},
				populateStage,
				categoryPopulateStage,
			},
		},
			{
				Key: "count",
				Value: bson.A{
					bson.D{{
						Key: "$match",
						Value: bson.D{{
							Key: "$and",
							Value: bson.A{
								bson.D{
									{
										Key:   "type",
										Value: "video",
									},
								},
								bson.D{
									{
										Key: "$or",
										Value: bson.A{
											bson.D{{
												Key: "title",
												Value: bson.D{{
													Key:   "$regex",
													Value: ".*" + search + ".*",
												},
													{
														Key:   "$options",
														Value: "i",
													},
												},
											}},
											bson.D{{
												Key: "description",
												Value: bson.D{{
													Key:   "$regex",
													Value: ".*" + search + ".*",
												},
													{
														Key:   "$options",
														Value: "i",
													},
												},
											}},
											bson.D{{
												Key:   "category",
												Value: categoryResult.Id,
											}},
										},
									},
								},
							},
						}},
					},
					},
				},
			},
		},
	},
	}
	projectStage := bson.D{{
		Key: "$project",
		Value: bson.D{
			{
				Key:   "results",
				Value: 1,
			},
			{
				Key: "count",
				Value: bson.D{{
					Key:   "$size",
					Value: "$count",
				}},
			},
		},
	}}
	addExtraFieldStage := bson.D{{
		Key: "$addFields",
		Value: bson.D{{
			Key:   "page",
			Value: page,
		}, {
			Key:   "limit",
			Value: limit,
		}},
	}}
	var result []bson.M
	opts := options.Aggregate().SetMaxTime(2 * time.Second)
	cursor, err := coll.Aggregate(context.TODO(), mongo.Pipeline{filterStage, projectStage, addExtraFieldStage}, opts)
	fmt.Println(err)
	if err != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to load data",
		})
	}
	if err := cursor.All(context.TODO(), &result); err != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to load data",
		})
	}
	return fiberCtx.JSON(result[0])
}

func (c *Controller) DeleteFootage(res *fiber.Ctx) error {
	// user_id, _ := primitive.ObjectIDFromHex(res.Cookies("id"))
	coll := c.DB.Database("test").Collection("file")
	file_id, _ := primitive.ObjectIDFromHex(res.Params("id"))
	var file model.File
	coll.FindOneAndDelete(context.TODO(), bson.D{{
		Key:   "_id",
		Value: file_id,
	}}).Decode(&file)

	var public_filepath string
	var private_filepath string
	if file.Type == "image" {

		public_filepath = fmt.Sprintf("./../storage/images/public/public_%s", file.FileName)
		private_filepath = fmt.Sprintf("./../storage/images/private/%s", file.FileName)
	} else {
		public_filepath = fmt.Sprintf("./../storage/videos/public/public_%s", file.FileName)
		private_filepath = fmt.Sprintf("./../storage/videos/private/%s", file.FileName)
	}

	os.Remove(public_filepath)
	os.Remove(private_filepath)

	return res.JSON(fiber.Map{
		"msg": "Deleted!",
	})
}

func (c *Controller) EditFootage(res *fiber.Ctx) error {
	file_id, _ := primitive.ObjectIDFromHex(res.Params("id"))
	var body struct {
		Title       string `json:"title"`
		Description string `json:"description"`
	}
	if err := res.BodyParser(&body); err != nil {
		return res.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Couldnot load details",
		})
	}
	if body.Title == "" || body.Description == "" {
		return res.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Either title or description is empty",
		})
	}
	coll := c.DB.Database("test").Collection("file")
	err := coll.FindOneAndUpdate(context.TODO(), bson.D{{
		Key:   "_id",
		Value: file_id,
	}},
		bson.D{{
			Key: "$set",
			Value: bson.D{{
				Key:   "title",
				Value: body.Title,
			},
				{
					Key:   "description",
					Value: body.Description,
				},
			},
		}},
	)
	if err.Err() != nil {
		return res.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to update",
		})
	}
	return res.JSON(fiber.Map{
		"msg": "Updated!",
	})
}
