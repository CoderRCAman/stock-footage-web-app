package controller

import (
	"testing"

	"github.com/go-playground/validator/v10"
)

type Author struct {
	FirstName string `validate:"min=3,max=20,required" bson:"given_name" json:"given_name"`
	LastName  string `validate:"min=3,max=20,required" bson:"surname" json:"surname"`
}

type Book struct {
	// Here, if ID is set, it needs to be a valid ObjectID

	ISBN  string `validate:"isbn13" bson:"isbn,omitempty" json:"isbn,omitempty"`
	Title string `validate:"min=3,max=20,required" bson:"title" json:"title"`
	Email string `validate:"email,required" bson:"email" json:"email"`
	// This instructs govalidator to validate the referenced struct, even when
	// it is a pointer
	Author *Author `validate:"required,dive,required" bson:"author" json:"author"`
}

// ObjectIDValidator validates whether the given type is a primitive.ObjectId
// and whether its value is valid.
// govalidator only validates a string as ObjectId, so we implement a little wrapper function...

// ...and add it to the validators you can use as a struct tag

func TestValidity(t *testing.T) {
	testCases := []struct {
		desc         string
		book         Book
		expectedFail bool
	}{
		// {
		// 	desc: "A book with an invalid ISBN",
		// 	book: Book{

		// 		Title:  "foobar",
		// 		ISBN:   "abc",
		// 		Author: &Author{FirstName: "Foo", LastName: "Bar"},
		// 		Email:  "",
		// 	},
		// 	expectedFail: true,
		// },
		{
			desc: "A perfectly valid (and good!) book",
			book: Book{

				Title:  "Neuromancer",
				ISBN:   "978-0441569595",
				Author: &Author{FirstName: "William", LastName: "Gibson"},
				Email:  "musafir@gmail.com",
			},
			expectedFail: false,
		},
		{
			desc: "Still a good book, but with the title cut short",
			book: Book{

				Title:  "Neur",
				ISBN:   "978-0441569595",
				Author: &Author{FirstName: "William", LastName: "Gibson"},
				Email:  "musafir1@gmail.com",
			},
			expectedFail: true,
		},
		{
			desc: "Still a good book, only the author's name was cut short",
			book: Book{

				Title:  "Neuromancer",
				ISBN:   "978-0441569595",
				Author: &Author{FirstName: "Wjiji", LastName: "Gibson"},
				Email:  "musafir@bespermail.com",
			},
			expectedFail: true,
		},
	}

	validate := validator.New()

	for _, tC := range testCases {
		t.Run(tC.desc, func(t *testing.T) {

			err := validate.Struct(tC.book)

			if err != nil {
				t.Errorf("Error is%v", err)
			}

		})

	}
}
