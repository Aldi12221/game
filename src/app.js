const express = require('express')
const app=express()
const port =3000

app.use((req,res)=>{
    res.send('hello word')
})

app.listen(port,()=>{
    console.log(`server jalan di port ${port}`)
})