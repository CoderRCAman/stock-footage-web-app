package model

import (
	"strings"

	"github.com/microcosm-cc/bluemonday"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Id             primitive.ObjectID   `bson:"_id,omitempty" json:"_id"`
	Name           string               `validate:"required,min=3,max=24" bson:"name,truncate" json:"name"`
	Email          string               `validate:"required,email" bson:"email,truncate" json:"email"`
	Password       string               `validate:"required" bson:"password" json:"password"`
	Phone          string               `validate:"required,e164" bson:"phone" json:"phone"`
	Role           string               `bson:"role" json:"role"`
	Uploads        []primitive.ObjectID `bson:"uploads,omitempty" json:"uploads"`
	Recommend      bool                 `validate:"required" bson:"recommend" json:"recommend"`
	Recommendation []primitive.ObjectID `bson:"recommendation,omitempty" json:"recommendation"`
	Credits        int32                `bson:"credits" json:"credits"`
	Payments       []primitive.ObjectID `bson:"payments,omitempty" json:"payments"`
	Downloads      []primitive.ObjectID `bson:"downloads,omitempty" json:"downloads"`
	Avatar         string               `bson:"avatar" json:"avatar"`
	Filename       string               `bson:"file_name" json:"file_name"`
}

func (u *User) TrimFields() {
	u.Name = strings.Trim(u.Name, " ")
	u.Email = strings.Trim(u.Email, " ")
	u.Password = strings.Trim(u.Password, " ")
	u.Phone = strings.Trim(u.Phone, " ")
}

func (u *User) SanitizeHtml() {
	p := bluemonday.StrictPolicy()
	u.Name = p.Sanitize(u.Name)
	u.Phone = p.Sanitize(u.Phone)
}

func (u *User) HashPassword() error {
	hashed, err := bcrypt.GenerateFromPassword([]byte(u.Password), 10)
	if err != nil {
		return err
	}
	u.Password = string(hashed)
	return nil
}

func (u *User) ValidatePassword(password string) error {
	if err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password)); err != nil {
		return err
	}
	return nil
}
