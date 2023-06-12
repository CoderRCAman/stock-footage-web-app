package middleware

import (
	"context"
	"fmt"
	"strings"
	"time"

	model "github.com/coderRCAman/models"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Middleware struct {
	//db
	DB *mongo.Client
}

func NewMiddleware(db *mongo.Client) *Middleware {
	return &Middleware{
		DB: db,
	}
}

func (m *Middleware) IsAuthenticated(c *fiber.Ctx) error {
	id := c.Cookies("id")
	role := c.Cookies("role")
	fmt.Println("middleware", id, role)
	if (id != "") && (role != "") {
		return c.Next()
	}
	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
		"msg": "redirect to login!",
	})
}
func (m *Middleware) IsAdmin(c *fiber.Ctx) error {
	role := c.Cookies("role")
	if role != "admin" {
		return c.Next()
	}
	return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
		"msg": "Denied Access!",
	})
}

func (m *Middleware) IsAvailableCredits(c *fiber.Ctx) error {
	return nil
}

func (m *Middleware) IsAllowedDownload(c *fiber.Ctx) error {
	url := c.OriginalURL()
	parts := strings.Split(url, "/")
	filepart := parts[len(parts)-1]
	finalParts := strings.Split(filepart, "?")
	filename := finalParts[0]
	coll := m.DB.Database("test").Collection("file")
	var file model.File
	fmt.Println(filename)
	err := coll.FindOne(context.TODO(), bson.D{{
		Key:   "file_name",
		Value: filename,
	}}).Decode(&file)

	if err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"msg": "no such file!",
		})
	}

	coll = m.DB.Database("test").Collection("user")
	user_id, _ := primitive.ObjectIDFromHex(c.Cookies("id"))
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
				Value: "download",
			},
			{
				Key:   "localField",
				Value: "downloads",
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
	var result []bson.M
	opts := options.Aggregate().SetMaxTime(2 * time.Second)
	cursor, err := coll.Aggregate(context.TODO(), mongo.Pipeline{filterStage, populateStage}, opts)
	fmt.Println(err)
	if err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"msg": "no such file!",
		})
	}
	if err := cursor.All(context.TODO(), &result); err != nil {
		fmt.Println(err)
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"msg": "no such file!",
		})
	}
	user := result[0]
	fmt.Println(user["downloads"])
	if user["_id"] == file.User {
		return c.Next()
	}
	downloads := convertToPrimitiveObjectIDs(user["downloads"].(primitive.A))
	if checkFileDownloaded(downloads, file.Id) {
		return c.Next()
	}
	if user["credits"].(int64) >= 1 {
		fmt.Println("invoked")
		newDownload := model.Download{
			File:      file.Id,
			User:      user_id,
			CreatedAt: time.Now(),
		}
		coll := m.DB.Database("test").Collection("download")
		insertRes, _ := coll.InsertOne(context.TODO(), newDownload)
		fmt.Println(insertRes)
		coll = m.DB.Database("test").Collection("user")
		edr := coll.FindOneAndUpdate(context.TODO(), bson.D{{
			Key:   "_id",
			Value: user_id,
		}},
			bson.D{
				{
					Key: "$inc",
					Value: bson.D{{
						Key:   "credits",
						Value: -1,
					}},
				},
				{
					Key: "$addToSet",
					Value: bson.D{{
						Key:   "downloads",
						Value: insertRes.InsertedID,
					}},
				}})
		fmt.Println(edr.Err())
		return c.Next()
	}

	return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
		"msg": "Dont have credits to download!",
	})
}

func checkFileDownloaded(downloads []bson.M, fileId primitive.ObjectID) bool {
	fmt.Println(downloads)
	for _, val := range downloads {
		if val["file"] == fileId {
			return true
		}
	}
	return false
}
func convertToPrimitiveObjectIDs(arr []interface{}) []bson.M {
	result := make([]bson.M, len(arr))
	for i, val := range arr {
		result[i] = val.(bson.M)
	}
	return result
}
