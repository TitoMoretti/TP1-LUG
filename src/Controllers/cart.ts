import express, { Request, Response } from 'express';
import cartModel from "../Models/cart"
import productModel from "../Models/products"

const cartController = {
    get: async (req: any, res: any) =>{
        try
        {
            const myCart = await cartModel.findOne()
            if (myCart) {
                let i, totalPrices=0, price=0, cant=0;
            
                const cart = await cartModel.find()

                for (i=0; i < cart.length; i++)
                {
                    price = cart[i].price
                    cant = cart[i].amount

                    totalPrices = totalPrices + (cant*price)
                }
                res.status(200).send("Su carrito actualmente está conformado de los siguientes productos:\n\n" +cart+ "\n\nEl precio total de todo es: $"+totalPrices)
            } else {         
                res.send("Actualmente su carrito está vacio.\nPruebe agragar algún producto.")
            }
        }
        //En caso de algun error
        catch (error)
        {
            res.send("Ha ocurrido un error. Por favor vuelva a intentarlo");
        }
    },
    add: async (req: any, res: any) =>{ 
        try{
            const isInProducts = await productModel.findOne({name: req.body.name})
            const isInCart = await cartModel.findOne({name: req.body.name})
            
            if(isInProducts){
                if(isInProducts.stock >= 1) {
                    if(!isInCart){
                        const newProductInCart = new cartModel({name: isInProducts.name, amount: 1, price: isInProducts.price})            
                        isInProducts.stock=isInProducts.stock-1;          
                        newProductInCart.save();
                        isInProducts.save();
                        res.send("Se ha podido agreagar un '" +newProductInCart.name+ "' al carrito con éxito!\nLos datos del producto dentro del carrito ahora son:\n\n"+newProductInCart);
                    } else {
                        const product = isInCart;
                        product.amount=product.amount+1;
                        isInProducts.stock=isInProducts.stock-1;
                        isInProducts.save()
                        product.save()
                        res.send("Se ha agregado una unidad de '" +isInProducts.name+ "'.\nLos datos del producto dentro del carrito ahora son:\n\n"+product)
                    }
                } else {
                    res.send("Lo siento, pero este producto actualmente no está disponible. Pruebe agregar otro que si tengamos stock")
                }
            }else{
                res.send("Lo siento, pero este producto no está en nuestra selección")
            }
        }
        //En caso de algun error
        catch(error){
            res.send("Ha ocurrido un error. Por favor vuelva a intentarlo");
        }
    },
    post: async(req: any, res: any)=>{
        try{

        } 
        //En caso de algun error
        catch(error){
            res.send("Ha ocurrido un error. Por favor vuelva a intentarlo");
        }
    },
    delete: async(req: any, res: any)=>{
        try{
            const isInProducts = await productModel.findOne({name: req.body.name})
            const isInCart = await cartModel.findOne({name: req.body.name})
            
            if(isInProducts){
                if(isInCart){
                    if(isInCart.amount == 1){
                        const product = isInCart;
                        product.amount = 0;
               
                        const deleteProduct = await cartModel.findOneAndDelete({name: req.body.name});

                        isInProducts.stock=isInProducts.stock + 1;
                        isInProducts.save();

                        res.send("Se ha eliminado el producto '" +deleteProduct?.name+ "'del carrito.");
                    } else {
                        const product = isInCart;
                        product.amount=product.amount-1;
                        isInProducts.stock=isInProducts.stock+1;
                        isInProducts.save()
                        product.save()
                        res.send("Se ha eliminado una unidad de '" +isInProducts.name+ "'.\nLos datos del producto dentro del carrito ahora son:\n\n"+product)
                    }
                } else {
                    res.send("Lo siento, pero este producto no se encuentra actualmente en el carrito. \nPruebe agregarlo primero")
                }
            }else{
                res.send("Lo siento, pero este producto no está en nuestra selección")
            } 
        } 
        //En caso de algun error
        catch(error){
            res.send("Ha ocurrido un error. Por favor vuelva a intentarlo");
        }
    },
}

export default cartController;