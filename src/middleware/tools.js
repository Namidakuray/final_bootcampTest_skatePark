const getStringDate = ()=>{
    const d = new Date();
    return d.toJSON().split(":")[0].slice(0,10);
}
module.exports={
    getStringDate
}