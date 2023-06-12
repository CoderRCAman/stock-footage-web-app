package model

import (
	"time"

	"github.com/microcosm-cc/bluemonday"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type File struct {
	Id          primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Title       string             `validate:"required,min=5,max=30" bson:"title" json:"title"`
	Description string             `validate:"required,min=5,max=100" bson:"description" json:"description"`
	FileName    string             `validate:"required" bson:"file_name" json:"file_name"`
	PublicUrl   string             `bson:"public_url" json:"public_url"`
	PrivateUrl  string             `bson:"private_url" json:"private_url"`
	License     string             `validate:"licensetype" bson:"license" json:"license"`
	Height      int32              `validate:"required,number" bson:"height" json:"height"`
	Width       int32              `validate:"required,number" bson:"width" json:"width"`
	User        primitive.ObjectID `bson:"user" json:"user"`
	Type        string             `bson:"type" json:"type"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	Category    primitive.ObjectID `validate:"required" bson:"category" json:"category"`
}

func (f *File) SanitizeHtml() {
	p := bluemonday.StrictPolicy()
	f.Title = p.Sanitize(f.Title)
	f.Description = p.Sanitize(f.Description)
}
