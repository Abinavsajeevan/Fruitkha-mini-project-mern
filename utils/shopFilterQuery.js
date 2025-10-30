

async function shopFilter(query) {
      // Get all filters and pagination from query
    const page = parseInt(query.page) || 1;
    const category = query.category || '';
    const availability = query.availability || '';
    const sort = query.sort || '';
    const min_max = query.min_max || '';
    const offer = query.offer || '';

    // ---------- Apply Filters ----------
    const filter = {};
    if (category) filter.category = category;
    if (availability === 'In Stock') filter.stock = { $gt: 0 };
    if (availability === 'Out of Stock') filter.stock = { $lte: 0 };
    if (availability === 'Low Stock') filter.stock = {$gt: 0, $lt: 15}

    // Price range filter
    if (min_max === 'Less than Rs 20') filter.price = { $lt: 20 };
    else if (min_max === 'Rs 21 to Rs 50') filter.price = { $gte: 21, $lte: 50 };
    else if (min_max === 'Rs 51 to Rs 100') filter.price = { $gte: 51, $lte: 100 };
    else if (min_max === 'Rs 101 to Rs 200') filter.price = { $gte: 101, $lte: 200 };
    else if (min_max === 'Rs 201 to Rs 500') filter.price = { $gte: 201, $lte: 500 };
    else if (min_max === 'More than Rs 500') filter.price = { $gt: 500 };

    // Offer range (optional – uncomment if you need it)
    // if (offer === '5% - 10%') filter.discount = { $gte: 5, $lte: 10 };
    // else if (offer === '10% - 20%') filter.discount = { $gte: 10, $lte: 20 };
    // else if (offer === '20% - 30%') filter.discount = { $gte: 20, $lte: 30 };
    // else if (offer === '30% - 40%') filter.discount = { $gte: 30, $lte: 40 };
    // else if (offer === 'More than 40%') filter.discount = { $gt: 40 };

    // ---------- Sorting ----------
    let sortOption = {};
    if (sort === 'low-high') sortOption.price = 1;
    else if (sort === 'high-low') sortOption.price = -1;
    else if (sort === 'newest') sortOption.createdAt = -1;
    else sortOption.updatedAt = 1;

  return { page, filter, sortOption, category, availability, sort, min_max, offer };
}

module.exports = shopFilter;