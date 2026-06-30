package catalog

// ApparelSizes for shirts, sweaters, polos, suits, blazers, trousers, linen, t-shirts, track suits, jackets.
var ApparelSizes = []string{"S", "M", "L", "XL", "2XL", "XXL", "4XL"}

// CapSizes for caps & hats.
var CapSizes = []string{"S", "M", "L", "XL"}

// SizeProfile maps category slug patterns to size sets.
func SizeProfile(categorySlug string) []string {
	switch categorySlug {
	case "caps-hats":
		return CapSizes
	case "belts-ties":
		return nil // no sizes
	default:
		return ApparelSizes
	}
}

func UsesSize(categorySlug string) bool {
	return len(SizeProfile(categorySlug)) > 0
}
