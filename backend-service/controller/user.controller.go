package controller

import (
	"context"
	"fmt"
	"os"
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

func (c *Controller) GetUserById(fiberCtx *fiber.Ctx) error {
	id := fiberCtx.Params("id")
	coll := c.DB.Database("test").Collection("user")
	fmt.Println(fiberCtx.Cookies("id"), fiberCtx.Cookies("role"))
	var response bson.M
	err := coll.FindOne(context.TODO(),
		bson.D{
			{
				Key:   "_id",
				Value: id,
			},
		}).Decode(&response)

	if err != nil {
		return fiberCtx.Status(fiber.StatusForbidden).SendString(fmt.Sprintf("Could not found any user with id: %v", id))
	}
	return fiberCtx.Status(fiber.StatusOK).JSON(response)
}

func (c *Controller) Signup(fiberCtx *fiber.Ctx) error {
	coll := c.DB.Database("test").Collection("user")
	p := new(model.User)
	if err := fiberCtx.BodyParser(p); err != nil {
		return fiberCtx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"msg": "Failed to load the input fields",
		})
	}
	p.TrimFields()
	p.Role = "user"
	p.Recommend = true
	validate := validator.New()
	if err := validate.Struct(p); err != nil {
		return fiberCtx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"msg": "Some input fields are invalid please re-validate!",
		})
	}
	p.SanitizeHtml()
	if err := p.HashPassword(); err != nil {
		return fiberCtx.Status(fiber.StatusFailedDependency).JSON(fiber.Map{
			"msg": "Failed to save the password",
		})
	}
	var user bson.M
	err := coll.FindOne(context.TODO(),
		bson.D{
			{
				Key:   "email",
				Value: p.Email,
			},
		},
	).Decode(&user)

	if err == nil || user != nil {
		return fiberCtx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"msg": fmt.Sprintf("User with %v email alredy exist!", p.Email),
		})
	}

	result, err := coll.InsertOne(context.TODO(), p)
	if err != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to add",
		})
	}
	return fiberCtx.Status(fiber.StatusCreated).JSON(result)
}

func (c *Controller) Signin(fiberCtx *fiber.Ctx) error {
	p := &struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}{}
	if err := fiberCtx.BodyParser(p); err != nil {
		return fiberCtx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"msg": "Cannot load the email and password!",
		})
	}
	var user model.User
	fmt.Println(fiberCtx.Cookies("id"))
	coll := c.DB.Database("test").Collection("user")
	err := coll.FindOne(context.TODO(), bson.D{
		{
			Key:   "email",
			Value: p.Email,
		},
	}).Decode(&user)

	if err != nil {
		return fiberCtx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"msg": "no such email exist!",
		})
	}
	err = user.ValidatePassword(p.Password)
	if err != nil {
		return fiberCtx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"msg": fmt.Sprintf("Password didnot matched for %v", p.Email),
		})
	}
	//set cookies
	cookie := new(fiber.Cookie)
	cookie.Name = "id"
	cookie.Value = user.Id.Hex()
	cookie.Expires = time.Now().Add(24 * time.Hour)
	fiberCtx.Cookie(cookie)
	cookie.Name = "role"
	cookie.Value = user.Role
	cookie.Expires = time.Now().Add(24 * time.Hour)
	fiberCtx.Cookie(cookie)
	cookie.Name = "recommend"
	if user.Recommend {
		cookie.Value = "done"
	} else {
		cookie.Value = "pending"
	}

	cookie.Expires = time.Now().Add(24 * time.Hour)
	fiberCtx.Cookie(cookie)
	return fiberCtx.Status(fiber.StatusOK).JSON(fiber.Map{
		"id":   user.Id.Hex(),
		"role": user.Role,
		"auth": true,
	})
}

func (c *Controller) UserInfo(fiberCtx *fiber.Ctx) error {
	user_id, _ := primitive.ObjectIDFromHex(fiberCtx.Cookies("id"))
	fmt.Println(user_id)
	coll := c.DB.Database("test").Collection("user")
	var result []bson.M
	filterStage := bson.D{{
		Key: "$match",
		Value: bson.D{{
			Key:   "_id",
			Value: user_id,
		}},
	}}

	populateStage := bson.D{{
		Key: "$lookup",
		Value: bson.D{
			{
				Key:   "from",
				Value: "file",
			},
			{
				Key:   "localField",
				Value: "uploads",
			},
			{
				Key: "pipeline",
				Value: bson.A{
					bson.D{{
						Key: "$lookup",
						Value: bson.D{{
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
					}},
				},
			},
			{
				Key:   "foreignField",
				Value: "_id",
			},
			{
				Key:   "as",
				Value: "uploads",
			},
		},
	}}
	paymentPopulateStage := bson.D{{
		Key: "$lookup",
		Value: bson.D{
			{
				Key:   "from",
				Value: "payment",
			},
			{
				Key:   "localField",
				Value: "payments",
			},

			{
				Key:   "foreignField",
				Value: "_id",
			},
			{
				Key:   "as",
				Value: "payments",
			},
		},
	}}
	downloadPopulateStage := bson.D{{
		Key: "$lookup",
		Value: bson.D{
			{
				Key:   "from",
				Value: "download",
			},
			{
				Key:   "localField",
				Value: "downloads",
			},
			{
				Key: "pipeline",
				Value: bson.A{
					bson.D{{
						Key: "$lookup",
						Value: bson.D{{
							Key:   "from",
							Value: "file",
						},
							{
								Key:   "localField",
								Value: "file",
							},
							{
								Key: "pipeline",
								Value: bson.A{
									bson.D{{
										Key: "$lookup",
										Value: bson.D{{
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
									}},
								},
							},
							{
								Key:   "foreignField",
								Value: "_id",
							},
							{
								Key:   "as",
								Value: "file",
							},
						},
					}},
				},
			},
			{
				Key:   "foreignField",
				Value: "_id",
			},
			{
				Key:   "as",
				Value: "downloads",
			},
		},
	}}

	projectStage := bson.D{{
		Key: "$project",
		Value: bson.D{
			{
				Key:   "password",
				Value: 0,
			},
		},
	}}
	opts := options.Aggregate().SetMaxTime(2 * time.Second)
	cursor, err := coll.Aggregate(context.TODO(), mongo.Pipeline{filterStage, populateStage, paymentPopulateStage, downloadPopulateStage, projectStage}, opts)
	if err != nil {
		panic(err)
	}
	if err := cursor.All(context.TODO(), &result); err != nil {
		panic(err)
	}

	return fiberCtx.JSON(result)
}

func (c *Controller) UpdateRecommendation(fiberCtx *fiber.Ctx) error {
	user_id, _ := primitive.ObjectIDFromHex(fiberCtx.Cookies("id"))
	var body struct {
		Ids []string `json:"ids"`
	}

	if err := fiberCtx.BodyParser(&body); err != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to load the categories",
		})
	}
	data := []primitive.ObjectID{}
	for _, item := range body.Ids {
		id, _ := primitive.ObjectIDFromHex(item)
		data = append(data, id)
	}
	coll := c.DB.Database("test").Collection("user")
	filter := bson.D{
		{
			Key:   "_id",
			Value: user_id,
		},
	}
	update := bson.D{
		{
			Key: "$set",
			Value: bson.D{
				{
					Key:   "recommendation",
					Value: data,
				},
			},
		},
		{
			Key: "$set",
			Value: bson.D{
				{
					Key:   "recommend",
					Value: false,
				},
			},
		},
	}
	err := coll.FindOneAndUpdate(context.TODO(), filter, update)
	if err.Err() != nil {
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to update retry again!",
		})
	}
	return fiberCtx.JSON(fiber.Map{
		"msg": "done!",
	})
}

func (c *Controller) Logout(fiberCtx *fiber.Ctx) error {
	fiberCtx.Cookie(&fiber.Cookie{
		Name: "id",
		// Set expiry date to the past
		Expires: time.Now().Add(-(24 * time.Hour)),
	})
	fiberCtx.Cookie(&fiber.Cookie{
		Name: "role",
		// Set expiry date to the past
		Expires: time.Now().Add(-(24 * time.Hour)),
	})
	fiberCtx.Cookie(&fiber.Cookie{
		Name: "recommend",
		// Set expiry date to the past

	})
	return fiberCtx.JSON(fiber.Map{
		"msg": "logged out!",
	})
}

func (c *Controller) GuestImages(fiberCtx *fiber.Ctx) error {
	coll := c.DB.Database("test").Collection("file")
	var result []bson.M
	opts := options.Aggregate().SetMaxTime(2 * time.Second)
	filterStage := bson.D{{
		Key: "$match",
		Value: bson.D{
			{
				Key:   "type",
				Value: "image",
			},
		},
	}}
	limitStage := bson.D{{
		Key:   "$limit",
		Value: 15,
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
	cursor, err := coll.Aggregate(context.TODO(), mongo.Pipeline{filterStage, limitStage, populateStage, categoryPopulateStage}, opts)
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
	return fiberCtx.JSON(result)
}
func (c *Controller) GuestVideos(fiberCtx *fiber.Ctx) error {
	coll := c.DB.Database("test").Collection("file")
	var result []bson.M
	opts := options.Aggregate().SetMaxTime(2 * time.Second)
	filterStage := bson.D{{
		Key: "$match",
		Value: bson.D{
			{
				Key:   "type",
				Value: "video",
			},
		},
	}}
	limitStage := bson.D{{
		Key:   "$limit",
		Value: 15,
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

	cursor, err := coll.Aggregate(context.TODO(), mongo.Pipeline{filterStage, limitStage, populateStage, categoryPopulateStage}, opts)
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
	return fiberCtx.JSON(result)
}

func (c *Controller) GetImages(fiberCtx *fiber.Ctx) error {
	userid, _ := primitive.ObjectIDFromHex(fiberCtx.Cookies("id"))
	page, _ := strconv.Atoi(fiberCtx.Query("page"))
	limit, _ := strconv.Atoi(fiberCtx.Query("limit"))
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	fmt.Println(limit, page)
	coll := c.DB.Database("test").Collection("user")
	var user model.User
	err := coll.FindOne(context.TODO(), bson.D{{
		Key:   "_id",
		Value: userid,
	}}).Decode(&user)
	if err != nil {
		fmt.Println("Something went wrong!")
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Unable to find this user",
		})
	}
	coll = c.DB.Database("test").Collection("file")
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
							Value: bson.D{
								{
									Key: "$and",
									Value: bson.A{
										bson.D{
											{
												Key: "category",
												Value: bson.D{{
													Key:   "$in",
													Value: user.Recommendation,
												},
												},
											},
										},
										bson.D{
											{
												Key:   "type",
												Value: "image",
											},
										},
									},
								},
							},
						},
					},
					populateStage,
					categoryPopulateStage,
					bson.D{{
						Key:   "$skip",
						Value: (page - 1) * limit,
					}},
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
				},
			},
			{
				Key: "total_count",
				Value: bson.A{
					bson.D{{
						Key: "$match",
						Value: bson.D{{
							Key: "$and",
							Value: bson.A{
								bson.D{{
									Key: "category",
									Value: bson.D{{
										Key:   "$in",
										Value: user.Recommendation,
									}},
								}},
								bson.D{{
									Key:   "type",
									Value: "image",
								}},
							},
						}},
					}},
				},
			},
		}}}

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
					Value: "$total_count",
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
func (c *Controller) GetVideos(fiberCtx *fiber.Ctx) error {
	userid, _ := primitive.ObjectIDFromHex(fiberCtx.Cookies("id"))
	page, _ := strconv.Atoi(fiberCtx.Query("page"))
	limit, _ := strconv.Atoi(fiberCtx.Query("limit"))
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	fmt.Println(limit, page)
	coll := c.DB.Database("test").Collection("user")
	var user model.User
	err := coll.FindOne(context.TODO(), bson.D{{
		Key:   "_id",
		Value: userid,
	}}).Decode(&user)
	if err != nil {
		fmt.Println("Something went wrong!")
		return fiberCtx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Unable to find this user",
		})
	}
	coll = c.DB.Database("test").Collection("file")
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
							Value: bson.D{
								{
									Key: "$and",
									Value: bson.A{
										bson.D{
											{
												Key: "category",
												Value: bson.D{{
													Key:   "$in",
													Value: user.Recommendation,
												},
												},
											},
										},
										bson.D{
											{
												Key:   "type",
												Value: "video",
											},
										},
									},
								},
							},
						},
					},
					populateStage,
					categoryPopulateStage,
					bson.D{{
						Key:   "$skip",
						Value: (page - 1) * limit,
					}},
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
				},
			},
			{
				Key: "total_count",
				Value: bson.A{
					bson.D{{
						Key: "$match",
						Value: bson.D{{
							Key: "$and",
							Value: bson.A{
								bson.D{{
									Key: "category",
									Value: bson.D{{
										Key:   "$in",
										Value: user.Recommendation,
									}},
								}},
								bson.D{{
									Key:   "type",
									Value: "video",
								}},
							},
						}},
					}},
				},
			},
		}}}

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
					Value: "$total_count",
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

func (c *Controller) EditProfile(res *fiber.Ctx) error {
	userid, _ := primitive.ObjectIDFromHex(res.Cookies("id"))
	file, _ := res.FormFile("file")
	var update bson.D
	var user model.User
	name := res.FormValue("name")
	var uniqueFileName string
	coll := c.DB.Database("test").Collection("user")
	err := coll.FindOne(context.TODO(), bson.D{{
		Key:   "_id",
		Value: userid,
	}}).Decode(&user)
	if err != nil {
		if err != nil {
			return res.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"msg": "No such user to exists",
			})
		}
	}
	if file != nil {
		uniqueFileName = utility.UniqueFileName(file.Filename)
		err := res.SaveFile(file, fmt.Sprintf("./../storage/images/public/%s", uniqueFileName))
		if err != nil {
			return res.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"msg": "Failed to save file!",
			})
		}
		update = bson.D{{
			Key: "$set",
			Value: bson.D{{
				Key:   "avatar",
				Value: fmt.Sprintf("http://localhost:4269/api/public/%s", uniqueFileName),
			}},
		},
			{
				Key: "$set",
				Value: bson.D{{
					Key:   "file_name",
					Value: uniqueFileName,
				}},
			},
			{
				Key: "$set",
				Value: bson.D{{
					Key:   "name",
					Value: name,
				}},
			},
		}
	} else {
		update = bson.D{
			{
				Key: "$set",
				Value: bson.D{{
					Key:   "name",
					Value: name,
				}},
			},
		}
	}
	_, err = coll.UpdateOne(context.TODO(), bson.D{{
		Key:   "_id",
		Value: userid,
	}},
		update,
	)
	if err != nil {
		return res.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to edit profile",
		})
	}
	if file != nil {
		os.Remove(fmt.Sprintf("./../storage/images/public/%s", user.Filename))
	}
	return res.JSON(fiber.Map{
		"msg": "Updated successfully!",
	})
}

func (c *Controller) GetAllUsers(res *fiber.Ctx) error {
	col := c.DB.Database("test").Collection("user")
	var user []bson.M
	cursor, err := col.Find(context.TODO(), bson.D{{}})
	if err != nil {
		return res.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "couldnot find any user",
		})
	}

	if err := cursor.All(context.TODO(), &user); err != nil {
		return res.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to load data",
		})
	}
	return res.JSON(user)
}
func (c *Controller) GetAllPhoto(res *fiber.Ctx) error {
	col := c.DB.Database("test").Collection("file")
	var user []bson.M
	cursor, err := col.Find(context.TODO(), bson.D{{
		Key:   "type",
		Value: "image",
	}})
	if err != nil {
		return res.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "couldnot find any user",
		})
	}

	if err := cursor.All(context.TODO(), &user); err != nil {
		return res.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to load data",
		})
	}
	return res.JSON(user)
}
func (c *Controller) GetAllVideos(res *fiber.Ctx) error {
	col := c.DB.Database("test").Collection("file")
	var user []bson.M
	cursor, err := col.Find(context.TODO(), bson.D{{
		Key:   "type",
		Value: "video",
	}})
	if err != nil {
		return res.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "couldnot find any user",
		})
	}

	if err := cursor.All(context.TODO(), &user); err != nil {
		return res.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to load data",
		})
	}
	return res.JSON(user)
}
func (c *Controller) GetAllTransactions(res *fiber.Ctx) error {
	col := c.DB.Database("test").Collection("payment")
	var user []bson.M
	opts := options.Aggregate().SetMaxTime(2 * time.Second)
	cursor, err := col.Aggregate(context.TODO(), mongo.Pipeline{
		bson.D{
			{
				Key: "$match",
				Value: bson.D{{
					Key:   "status",
					Value: true,
				}},
			},
		},
		bson.D{
			{
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
			},
		},
		bson.D{{
			Key: "$sort",
			Value: bson.D{{
				Key:   "createdAt",
				Value: -1,
			}},
		}},
	}, opts)
	if err != nil {
		return res.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "couldnot find any user",
		})
	}

	if err := cursor.All(context.TODO(), &user); err != nil {
		return res.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to load data",
		})
	}
	return res.JSON(user)
}
