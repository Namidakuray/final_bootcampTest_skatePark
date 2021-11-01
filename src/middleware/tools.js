const getStringDate = ()=>{
    const d = new Date();
    return d.toJSON().split(":")[0].slice(0,10);
}
const getBiteToMB = (size)=>{
    let n = (size*1024)*1024;
    return n;
}
module.exports={
    getStringDate,
    getBiteToMB
}