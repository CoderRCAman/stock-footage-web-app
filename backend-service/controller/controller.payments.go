package controller

import (
	"context"
	"fmt"
	"os"
	"time"

	model "github.com/coderRCAman/models"
	"github.com/gofiber/fiber/v2"
	"github.com/stripe/stripe-go/v74"
	"github.com/stripe/stripe-go/v74/paymentintent"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type RequestBody struct {
	Amount  int64 `json:"amount"`
	Credits int64 `json:"credits"`
}

func (c *Controller) HandleCreatePaymentIntent(res *fiber.Ctx) error {
	userid, _ := primitive.ObjectIDFromHex(res.Cookies("id"))
	stripe.Key = os.Getenv("STIPE_SECRET_KEY")
	p := new(RequestBody)
	if err := res.BodyParser(p); err != nil {
		return res.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to load the input fields",
		})
	}
	fmt.Println(p)
	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(p.Amount),
		Currency: stripe.String(string(stripe.CurrencyINR)),
	}
	pi, err := paymentintent.New(params)
	if err != nil {
		return res.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "something went wrong!",
		})
	}
	coll := c.DB.Database("test").Collection("payment")
	newPayment := model.Payment{
		User:           userid,
		CreatedAt:      time.Now(),
		Credits:        p.Credits * 5,
		Status:         false,
		Amount:         p.Amount,
		Payment_Intent: pi.ID,
	}
	coll.InsertOne(context.TODO(), newPayment)
	return res.JSON(fiber.Map{
		"ClientSecret": pi.ClientSecret,
	})
}

func (c *Controller) SavePayment(res *fiber.Ctx) error {
	user_id, _ := primitive.ObjectIDFromHex(res.Cookies("id"))
	var body struct {
		Status         bool   `json:"status"`
		Payment_Intent string `json:"payment_intent"`
	}
	if err := res.BodyParser(&body); err != nil {
		return res.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to load the input fields",
		})
	}
	if !body.Status {
		return res.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed payment",
		})
	}
	var payment model.Payment
	coll := c.DB.Database("test").Collection("payment")
	fmt.Println(body.Payment_Intent)
	err := coll.FindOneAndUpdate(context.TODO(), bson.D{
		{
			Key: "$and",
			Value: bson.A{
				bson.D{{
					Key:   "payment_intent",
					Value: body.Payment_Intent,
				}},
				bson.D{{
					Key:   "status",
					Value: false,
				}},
			},
		},
	},
		bson.D{
			{
				Key: "$set",
				Value: bson.D{{
					Key:   "status",
					Value: true,
				}},
			},
		},
	).Decode(&payment)
	fmt.Println(payment)
	if err != nil {
		return res.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "No payment info exist",
		})
	}

	coll = c.DB.Database("test").Collection("user")
	fmt.Println(body, user_id)
	_, updateErr := coll.UpdateOne(context.TODO(), bson.D{{
		Key:   "_id",
		Value: user_id,
	}},
		bson.D{
			{
				Key: "$inc",
				Value: bson.D{{
					Key:   "credits",
					Value: payment.Credits,
				}},
			},
			{
				Key: "$addToSet",
				Value: bson.D{{
					Key:   "payments",
					Value: payment.Id,
				}},
			},
		},
	)
	fmt.Println(updateErr)
	if updateErr != nil {
		return res.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"msg": "Failed to add credits",
		})
	}
	return res.JSON(payment)
}
