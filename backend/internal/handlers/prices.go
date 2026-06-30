package handlers

import (
	"context"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// shopPrice returns list price for a product at a shop (falls back to product base_price).
func (h *Handler) shopPrice(ctx context.Context, shopID, productID uuid.UUID, basePrice float64) float64 {
	var price float64
	err := h.DB.QueryRow(ctx, `
		SELECT COALESCE(spp.price, $3)
		FROM products p
		LEFT JOIN shop_product_prices spp ON spp.product_id = p.id AND spp.shop_id = $1
		WHERE p.id = $2
	`, shopID, productID, basePrice).Scan(&price)
	if err != nil {
		return basePrice
	}
	return price
}

type setShopPriceRequest struct {
	ShopID    string  `json:"shop_id" binding:"required"`
	ProductID string  `json:"product_id" binding:"required"`
	Price     float64 `json:"price" binding:"required,gte=0"`
}

func (h *Handler) SetShopProductPrice(c *gin.Context) {
	var req setShopPriceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	shopID, err := uuid.Parse(req.ShopID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid shop_id"})
		return
	}
	productID, err := uuid.Parse(req.ProductID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product_id"})
		return
	}

	_, err = h.DB.Exec(c.Request.Context(), `
		INSERT INTO shop_product_prices (shop_id, product_id, price)
		VALUES ($1, $2, $3)
		ON CONFLICT (shop_id, product_id) DO UPDATE SET
			price = EXCLUDED.price,
			updated_at = NOW()
	`, shopID, productID, req.Price)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not save price"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"saved": true})
}

func (h *Handler) ListShopProductPrices(c *gin.Context) {
	shopID := c.Query("shop_id")
	productID := c.Query("product_id")
	query := `
		SELECT spp.shop_id::text, s.name, spp.product_id::text, p.name, spp.price
		FROM shop_product_prices spp
		JOIN shops s ON s.id = spp.shop_id
		JOIN products p ON p.id = spp.product_id
		WHERE 1=1
	`
	args := []interface{}{}
	n := 1
	if shopID != "" {
		query += ` AND spp.shop_id = $` + strconv.Itoa(n)
		args = append(args, shopID)
		n++
	}
	if productID != "" {
		query += ` AND spp.product_id = $` + strconv.Itoa(n)
		args = append(args, productID)
		n++
	}
	query += ` ORDER BY s.name, p.name`

	rows, err := h.DB.Query(c.Request.Context(), query, args...)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"prices": []interface{}{}})
		return
	}
	defer rows.Close()

	type row struct {
		ShopID      string  `json:"shop_id"`
		ShopName    string  `json:"shop_name"`
		ProductID   string  `json:"product_id"`
		ProductName string  `json:"product_name"`
		Price       float64 `json:"price"`
	}
	out := []row{}
	for rows.Next() {
		var r row
		if rows.Scan(&r.ShopID, &r.ShopName, &r.ProductID, &r.ProductName, &r.Price) == nil {
			out = append(out, r)
		}
	}
	c.JSON(http.StatusOK, gin.H{"prices": out})
}
