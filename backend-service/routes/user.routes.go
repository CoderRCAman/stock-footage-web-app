package routes

import (
	"github.com/gofiber/fiber/v2"
)

func (r *Routes) UserRoutes() {
	r.app.Get("/api/v1/user", func(c *fiber.Ctx) error {
		return c.SendString("Hello from user routes")
	})
	r.app.Get("/api/v1/user/find/:id", r.controller.GetUserById)
	r.app.Post("/api/v1/user/signup", r.controller.Signup)
	r.app.Post("/api/v1/user/signin", r.controller.Signin)
	r.app.Get("/api/v1/user/userinfo", r.controller.UserInfo)
	r.app.Patch("/api/v1/user/recommend", r.m.IsAuthenticated, r.controller.UpdateRecommendation)
	r.app.Get("/api/v1/logout", r.m.IsAuthenticated, r.controller.Logout)
	r.app.Get("/api/v1/user/guest/images", r.controller.GuestImages)
	r.app.Get("/api/v1/user/guest/videos", r.controller.GuestVideos)
	r.app.Get("/api/v1/user/images", r.m.IsAuthenticated, r.controller.GetImages)
	r.app.Get("/api/v1/user/videos", r.m.IsAuthenticated, r.controller.GetVideos)
	r.app.Patch("/api/v1/user/update", r.m.IsAuthenticated, r.controller.EditProfile)
}
