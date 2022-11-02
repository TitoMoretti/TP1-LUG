import express, { Request, Response } from 'express';
import productModel from "../Models/products";

const productController = {
    get: async (req: any, res: any) =>{ //PREGUNTAR SOBRE ANY
        try
        {
            //Intenta buscar todos los productos en el DB
            const allProducts = await productModel.find() 
            //Muestra todos los productos que están en el DB
            res.status(200).send("Dentro de la base de datos, se encontraron los siguientes productos:\n\n"+allProducts)
        }
        //En caso de algun error
        catch (error)
        {
            res.send("Ha ocurrido un error. Por favor vuelva a intentarlo");
        }
    },
    add: async (req: any, res: any) =>{
        try {
            const isInProduct = await productModel.findOne({name: req.body.name});
            if(!isInProduct){
                //Intenta eliminar el producto escrito en Postman en el DB
                const newProduct = new productModel({...req.body})
                await newProduct.save()
                //Muestra el producto añadido
                res.send("El producto '"+newProduct.name+"' se ha agregado correctamente. Sus datos son:\n\n"+newProduct)
            } else {
                res.send("Lo siento, pero este producto ya aparece en la Base de Datos. Por favor inserte otro.")
            }
        }
        //En caso de algun error
        catch (error) {
            res.send("Ha ocurrido un error. Por favor vuelva a intentarlo");
        }
    },
    delete: async(req: any, res: any)=>{
        try {
            //Se busca el producto en la base de datos
            const isInProduct = await productModel.findOne({name: req.body.name});
            if(isInProduct){
                //Intenta eliminar el producto escrito en Postman en el DB
                const deleteProduct = await productModel.findOneAndDelete({name: req.body.name});
                //Le avisa que se ha podido eliminar
                res.send("El producto '" + deleteProduct?.name + "' se ha podido eliminar correctamente.")
            } else {
                res.send("Lo siento, pero este producto no se ha encontrado en la Base de Datos.\nPor favor, prueba a agregar el mismo.")
            }
        }
        //En caso de algun error
        catch (error) {
            res.send("Ha ocurrido un error. Por favor vuelva a intentarlo");
        }
    },
    put: async(req: any, res: any)=>{ 
        try {
            //Se busca el producto en la base de datos
            const isInProduct = await productModel.findOne({name: req.body.name});
            if(isInProduct){
                //Intenta modificar el producto escrito en Postman en el DB
                isInProduct.name=req.body.name;
                isInProduct.stock=req.body.stock;
                isInProduct.price=req.body.price;
                isInProduct.save()
                //Le avisa que se ha podido modificar
                res.send("El producto '" + isInProduct.name + "' se ha podido actualizar correctamente. Sus datos ahora son:\n\n" +isInProduct)
            } else {
                res.send("Lo siento, pero este producto no se ha encontrados en la Base de Datos.\nPor favor, verifique que haya insertado el producto correcto o pruebe a agregar el mismo.")
            }
        }
        //En caso de algun error
        catch (error) {
            res.send("Ha ocurrido un error. Por favor vuelva a intentarlo");
        }
    },
}

export default productController;