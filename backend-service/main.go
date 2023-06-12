package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/coderRCAman/controller"
	"github.com/coderRCAman/database"
	"github.com/coderRCAman/middleware"
	"github.com/coderRCAman/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/encryptcookie"
	"github.com/gofiber/fiber/v2/middleware/filesystem"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

//!AUTHENTICATION IS KEPT FOR LATER PLEASE DO IT AFTER JUNE!

func main() {
	err := godotenv.Load()

	if err != nil {
		panic("Missing ENVIRONMENT variables")
	}
	mongoStore := database.NewMongoStore()
	controllerRef := controller.NewController(mongoStore.DB)
	_ = controllerRef
	middlewareRef := middleware.NewMiddleware(mongoStore.DB)
	PORT := os.Getenv("PORT")
	app := fiber.New(fiber.Config{
		BodyLimit: 20 * 1024 * 1024,
	})
	app.Use(encryptcookie.New(encryptcookie.Config{
		Key: os.Getenv("COOKIE_SECRET_KEY"),
	}))

	app.Static("/api/public/", "./../storage/images/public/")
	app.Static("/api/footage/public/", "./../storage/videos/public/", fiber.Static{
		Compress:  true,
		ByteRange: true,
		Browse:    true,
		Download:  true,
	})
	// app.Static("/api/downl")
	//! so many things to do setting up databases and all also video part is remaining payment admin and authentication!

	//!to do is to create controller
	app.Use(logger.New(logger.Config{
		Format: "${pid} ${locals:requestid} ${status} - ${method} ${path}​\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173, http://localhost:5174",
		AllowHeaders:     "Origin, Content-Type, Accept",
		AllowCredentials: true,
	}))
	app.Use("/api/private/", middlewareRef.IsAuthenticated, middlewareRef.IsAllowedDownload, filesystem.New(filesystem.Config{
		Root:   http.Dir("./../storage/images/private/"),
		Browse: true,
	}))
	app.Use("/api/footage/private/", middlewareRef.IsAuthenticated, middlewareRef.IsAllowedDownload, filesystem.New(filesystem.Config{
		Root:   http.Dir("./../storage/videos/private/"),
		Browse: true,
	}))
	app.Use("/api/free/image/", middlewareRef.IsAuthenticated, middlewareRef.IsAllowedDownload, filesystem.New(filesystem.Config{
		Root:   http.Dir("./../storage/images/public/"),
		Browse: true,
	}))
	app.Use("/api/free/footage/", middlewareRef.IsAuthenticated, middlewareRef.IsAllowedDownload, filesystem.New(filesystem.Config{
		Root:   http.Dir("./../storage/videos/public/"),
		Browse: true,
	}))
	routes := routes.NewRoutes(app, controllerRef, middlewareRef)
	routes.Run()
	app.Listen(fmt.Sprintf(":%s", PORT))

}
