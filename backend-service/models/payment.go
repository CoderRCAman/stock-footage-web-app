package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Payment struct {
	Id             primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Amount         int64              `bson:"amount" json:"amount"`
	User           primitive.ObjectID `bson:"user,omitempty" json:"user"`
	CreatedAt      time.Time          `bson:"createdAt" json:"createdAt"`
	Credits        int64              `bson:"credits" json:"credits"`
	Status         bool               `bson:"status" json:"status"`
	Payment_Intent string             `bson:"payment_intent" json:"payment_intent"`
}
