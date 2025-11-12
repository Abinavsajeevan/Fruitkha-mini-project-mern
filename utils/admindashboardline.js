

 function  getRangeStart(range) {
    const now = new Date();
    if(range === 'week') {
        const start = new Date(now);
        start.setDate(now.getDate() - 6); // last 7 days
        start.setHours(0,0,0,0);
        return start;
    }

    if(range === 'month') {
        const start = new Date(now);
        start.setDate(now.getDate() - 29); //last 30 days
        start.setHours(0,0,0,0);
        return start;
    }

    if(range ===  'year') {
        const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        start.setHours(0,0,0,0);
        return start;
    }

    // default week
//   return getRangeStart('week');
}

module.exports = getRangeStart;