package routes

func (r *Routes) CategoryRoutes() {
	r.app.Post("/api/v1/category", r.m.IsAdmin, r.controller.AddCategory)
	r.app.Get("/api/v1/category", r.controller.GetCategories)
	r.app.Patch("/api/v1/category/:id", r.m.IsAdmin, r.controller.EditCategory)
}
