package database

import (
	"context"
	"fmt"
	"log"
	"os"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoStore struct {
	DB *mongo.Client
}

func NewMongoStore() *MongoStore {
	uri := os.Getenv("MONGODB_URI")
	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal("Database not connected!")
	}
	fmt.Println("Database connected ok!")
	return &MongoStore{
		DB: client,
	}
}
