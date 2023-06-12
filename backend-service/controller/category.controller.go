package controller

import (
	"context"
	"fmt"
	"os"
	"path"
	"strings"
	"time"

	model "github.com/coderRCAman/models"
	"github.com/coderRCAman/utility"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (c *Controller) AddCategory(fiberCtx *fiber.Ctx) error {
	file, err := fiberCtx.FormFile("file")
	uniqueFileName := utility.UniqueFileName(file.Filename)
	coll := c.DB.Database("test").Collection("category")
	if err != nil {

		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Missing files!",
		})
	}
	//validate file type
	if !utility.ImageTypeValidate(file.Header.Get("Content-Type")) {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Invalid file type!",
		})
	}
	name := fiberCtx.FormValue("name")
	name = strings.ToLower(name)
	var categoryFound bson.M
	catErr := coll.FindOne(context.TODO(), bson.D{{Key: "name", Value: name}}).Decode(&categoryFound)
	if catErr == nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "This category already exist!",
		})
	}
	err = fiberCtx.SaveFile(file, fmt.Sprintf("./../storage/images/public/category_%s", uniqueFileName))
	if err != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Unable to save file!",
		})
	}
	newCategory := model.Category{
		Name:      name,
		Image_url: fmt.Sprintf("http://localhost:4269/api/public/category_%s", uniqueFileName),
		CreatedAt: time.Now(),
		Filename:  fmt.Sprintf("category_%s", uniqueFileName),
	}
	_, err = coll.InsertOne(context.TODO(), newCategory)
	if err != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Unable to save file!",
		})
	}
	return fiberCtx.JSON(newCategory)
}

func (c *Controller) GetCategories(fiberCtx *fiber.Ctx) error {

	coll := c.DB.Database("test").Collection("category")
	var categories []bson.M
	cursor, err := coll.Find(context.TODO(), bson.D{{}})
	if err != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Found no categories!",
		})
	}
	if err := cursor.All(context.TODO(), &categories); err != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Found no categories!",
		})
	}
	return fiberCtx.JSON(categories)
}

func (c *Controller) EditCategory(fiberCtx *fiber.Ctx) error {
	coll := c.DB.Database("test").Collection("category")
	id, _ := primitive.ObjectIDFromHex(fiberCtx.Params("id"))
	file, _ := fiberCtx.FormFile("file")
	name := fiberCtx.FormValue("name")
	filter := bson.D{{
		Key:   "_id",
		Value: id,
	}}
	var update bson.D
	if file == nil {
		update = bson.D{{
			Key: "$set",
			Value: bson.D{
				{
					Key:   "name",
					Value: name,
				},
			},
		}}

	} else {
		var cat bson.M
		_ = coll.FindOne(context.TODO(), bson.D{{
			Key:   "_id",
			Value: id,
		}}).Decode(&cat)
		filename := cat["filename"]
		deletePath := path.Join(".", "..", "storage", "images", "public", filename.(string))
		os.Remove(deletePath)
		uniqueFilename := utility.UniqueFileName(file.Filename)
		err := fiberCtx.SaveFile(file, fmt.Sprintf("./../storage/images/public/category_%s", uniqueFilename))
		if err != nil {
			return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"msg": "Unable to save file!",
			})
		}
		update = bson.D{{
			Key: "$set",
			Value: bson.D{
				{
					Key:   "name",
					Value: name,
				},
			},
		}, {
			Key: "$set",
			Value: bson.D{
				{
					Key:   "image_url",
					Value: fmt.Sprintf("http://localhost:4269/api/public/category_%s", uniqueFilename),
				},
			},
		},
			{
				Key: "$set",
				Value: bson.D{
					{
						Key:   "filename",
						Value: fmt.Sprintf("category_%s", uniqueFilename),
					},
				},
			},
		}
	}
	err := coll.FindOneAndUpdate(context.TODO(), filter, update)
	if err.Err() != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to update database",
		})
	}
	return fiberCtx.JSON(fiber.Map{
		"msg": "updated successfully!",
	})
}
