package routes

func (r *Routes) UploadRoutes() {
	r.app.Post("/api/v1/image/upload/", r.m.IsAuthenticated, r.controller.UploadImages)
	r.app.Post("/api/v1/video/upload/", r.m.IsAuthenticated, r.controller.UploadVideos)
	r.app.Get("/api/v1/file/:id", r.controller.GetFileById)
	r.app.Get("/api/v1/file/category/images/:id", r.controller.GetFilesByCategoryImages)
	r.app.Get("/api/v1/file/category/videos/:id", r.controller.GetFilesByCategoryVideos)
	r.app.Get("/api/v1/file/search/images/", r.controller.SearchImage)
	r.app.Get("/api/v1/file/search/videos/", r.controller.SearchVideo)
	r.app.Delete("/api/v1/file/delete/:id", r.m.IsAuthenticated, r.controller.DeleteFootage)
	r.app.Patch("/api/v1/file/edit/:id", r.m.IsAuthenticated, r.controller.EditFootage)

}
