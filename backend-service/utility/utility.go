package utility

import (
	"fmt"
	"path/filepath"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

func ImageTypeValidate(t string) bool {
	//imagetype
	isValid := false
	if t == "image/jpeg" {
		isValid = true
	}
	if t == "image/jpg" {
		isValid = true
	}
	if t == "image/png" {
		isValid = true
	}
	return isValid
}
func VideoTypeValidate(t string) bool {
	//imagetype
	isValid := false
	if t == "video/mp4" {
		isValid = true
	}
	return isValid
}

func LicenseTypeValidate(fl validator.FieldLevel) bool {
	//licensetype
	isValid := false
	if fl.Field().String() == "f2u" {
		isValid = true
	}
	if fl.Field().String() == "std" {
		isValid = true
	}
	return isValid
}

func UniqueFileName(fileName string) string {
	extension := filepath.Ext(fileName)
	randomString := uuid.New().String()
	return fmt.Sprintf("%s%s", randomString, extension)
}
