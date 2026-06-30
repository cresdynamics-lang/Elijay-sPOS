package main

import (
	"context"
	"log"
	"os"

	"github.com/cresdynamics-lang/pos-elijays/backend/internal/config"
	"github.com/cresdynamics-lang/pos-elijays/backend/internal/db"
	"github.com/cresdynamics-lang/pos-elijays/backend/internal/router"
)

func main() {
	cfg := config.Load()
	pool, err := db.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer pool.Close()

	email := os.Getenv("BOOTSTRAP_ADMIN_EMAIL")
	if email == "" {
		email = "admin@elijays.co.ke"
	}
	pass := os.Getenv("BOOTSTRAP_ADMIN_PASSWORD")
	if pass == "" {
		pass = "Elijays.Admin1"
	}
	name := os.Getenv("BOOTSTRAP_ADMIN_NAME")
	if name == "" {
		name = "Elijays Admin"
	}
	db.EnsureBootstrapUser(context.Background(), pool, email, pass, name)
	db.EnsureDemoCatalog(context.Background(), pool)

	r := router.New(pool, cfg)
	addr := ":" + cfg.Port
	log.Printf("Elijay's Men's Wear POS API listening on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatal(err)
	}
}
