package handlers

import (
	"net/http"

	"github.com/cresdynamics-lang/pos-elijays/backend/internal/config"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct {
	DB     *pgxpool.Pool
	Config config.Config
}

func New(db *pgxpool.Pool, cfg config.Config) *Handler {
	return &Handler{DB: db, Config: cfg}
}

func (h *Handler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"service": "elijays-pos",
		"brand":   "Elijay's Men's Wear",
	})
}
