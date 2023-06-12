package routes

func (r *Routes) PaymentsRoute() {
	r.app.Post("/api/v1/create-payment-intent", r.m.IsAuthenticated, r.controller.HandleCreatePaymentIntent)
	r.app.Post("/api/v1/add-payments", r.m.IsAuthenticated, r.controller.SavePayment)

}
