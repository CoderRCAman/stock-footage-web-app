package model

import (
	"time"

	"github.com/microcosm-cc/bluemonday"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Category struct {
	Id        primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name      string             `validate:"required,min=5,max=20" bson:"name" json:"name"`
	Image_url string             `validate:"required" bson:"image_url" json:"image_url"`
	CreatedAt time.Time          `validate:"required" bson:"createdAt" json:"createdAt"`
	Filename  string             `validate:"required" bson:"filename" json:"filename"`
}

func (c *Category) SanitizeHtml() {
	p := bluemonday.StrictPolicy()
	c.Name = p.Sanitize(c.Name)
}
