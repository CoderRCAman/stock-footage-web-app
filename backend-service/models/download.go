package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Download struct {
	Id        primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	User      primitive.ObjectID `bson:"user" json:"user"`
	File      primitive.ObjectID `bson:"file" json:"file"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}
