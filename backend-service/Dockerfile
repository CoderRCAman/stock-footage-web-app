# Use a Golang base image
FROM golang:latest

# Set the working directory inside the container
WORKDIR /app

# Copy the Go modules manifest and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code into the container
COPY . .

# Build the Go application
RUN go build -o main

# Expose the desired port (change if needed)
EXPOSE 4269

# Run the Go application
CMD ["./main"]