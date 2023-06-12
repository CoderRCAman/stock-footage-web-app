package routes

import (
	"github.com/coderRCAman/controller"
	"github.com/coderRCAman/middleware"
	"github.com/gofiber/fiber/v2"
)

type Routes struct {
	app        *fiber.App
	controller *controller.Controller
	m          *middleware.Middleware
}

func NewRoutes(fiberApp *fiber.App, ctrl *controller.Controller, mid *middleware.Middleware) *Routes {
	return &Routes{
		app:        fiberApp,
		controller: ctrl,
		m:          mid,
	}
}

func (r *Routes) Run() {
	r.app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello world this my go lang app!")
	})
	r.UploadRoutes()
	r.UserRoutes()
	r.CategoryRoutes()
	r.PaymentsRoute()
}
