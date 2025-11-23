

 function  getRangeStart(range) {
   const now = new Date();
   if( range === 'year' ) return new Date(now.getFullYear(), 0, 1);//0 and 1 are month and day
   if( range === 'month' ) return new Date(now.getFullYear(), now.getMonth(), 1); //this month 1 st day
   if( range === 'week' ) {
    const firstDayofWeek = now.getDate() - now.getDay();
    console.log(firstDayofWeek, 'sfsfs')
    return new Date(now.setDate(firstDayofWeek))
   }

   return new Date(now.getFullYear(), now.getMonth(), 1);
}

module.exports = getRangeStart;