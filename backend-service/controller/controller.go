package controller

import "go.mongodb.org/mongo-driver/mongo"

type Controller struct {
	//db
	DB *mongo.Client
}

func NewController(db *mongo.Client) *Controller {
	return &Controller{
		DB: db,
	}
}
