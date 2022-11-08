import express, { Request, Response } from 'express';
import cartModel from "../Models/cart"
import productModel from "../Models/products"
import detailsModel from "../Models/cartdetails"

const cartController = {
    get: async (req: any, res: any) =>{
        try
        {
            //Obtiene los datos del carrito y los productos dentro
            const miCart = await cartModel.findOne()
            //En el caso de que haya productos en el carrito
            if (miCart) {
                //Establezco variables
                let i, precioTotal=0, precio=0, cantidad=0;
                //Busca todos los producto ue están en el carrito
                const cart = await cartModel.find();
                //Se fija por todo el carrito y se ven los productos que tiene
                for (i=0; i < cart.length; i++)
                {
                    //Se obtiene el precio de cada producto
                    precio = cart[i].price;
                    //Se obtiene la cantidad de esté que está en la base de datos
                    cantidad = cart[i].amount;
                    //Se calcula el precio total de todos los productos que están en el carrito
                    precioTotal = precioTotal + (cantidad*precio);
                }
                //Le informa de todos los productos que están en el carrito, junto al precio total de todo
                res.status(200).send("Su carrito actualmente está conformado de los siguientes productos:\n\n" +cart+ "\n\nEl precio total de todo es: $"+precioTotal)
            } else {
                //En el caso de que no haya productos en el carrito         
                res.send("Actualmente su carrito está vacio.\nPruebe agragar algún producto.")
            }
        }
        //En caso de algun error inesperado
        catch (error)
        {
            res.send("Ha ocurrido un error. Por favor vuelva a intentarlo");
        }
    },
    add: async (req: any, res: any) =>{ 
        try{
            //Busca que el producto esté en la base de datos
            const isInProducts = await productModel.findOne({name: req.body.name})
            //Busca que el producto esté en el carrito
            const isInCart = await cartModel.findOne({name: req.body.name})
            
            //En el caso que el producto esté en la base de datos
            if(isInProducts){
                //Se fija si hay stock del producto. En el caso de que haya stock
                if(isInProducts.stock >= 1) {
                    //En el caso de que el producto no esté en el carrito
                    if(!isInCart){
                        //Tomo los datos del producto para agregarlo al carrito
                        const newProductInCart = new cartModel({name: isInProducts.name, amount: 1, price: isInProducts.price});            
                        //Disminuyo el stock que tiene
                        isInProducts.stock=isInProducts.stock-1;          
                        //Guardo el producto agregado al carrito a la base de datos
                        newProductInCart.save();
                        //Guardo el cambio del stock en la base de datos
                        isInProducts.save();
                        //Le aviso que el producto se agregó al carrito
                        res.send("Se ha podido agreagar un '" +newProductInCart.name+ "' al carrito con éxito!\nLos datos del producto dentro del carrito ahora son:\n\n"+newProductInCart);
                    } else {
                        //En el caso de que el producto esté en el carrito
                        //Tomos los valores del producto que está en el carrito
                        const product = isInCart;
                        //Aumento la cantidad de unidades del mismo dentro del carrito
                        product.amount=product.amount+1;
                        //Disminuyo el stock que tiene
                        isInProducts.stock=isInProducts.stock-1;
                        //Guardo los cambios en la base de datos
                        isInProducts.save();
                        product.save();
                        //Le aviso que se agregó otra unidad
                        res.send("Se ha agregado una unidad de '" +isInProducts.name+ "'.\nLos datos del producto dentro del carrito ahora son:\n\n"+product);
                    }
                } else {
                    //En el caso de que no haya stock, le avisa
                    res.send("Lo siento, pero este producto actualmente no está disponible. Pruebe agregar otro que si tengamos stock");
                }
            }else{
                //En el caso que el producto no esté en la base de datos
                res.send("Lo siento, pero este producto no está en nuestra selección");
            }
        }
        //En caso de algun error inesperado
        catch(error){
            res.send("Ha ocurrido un error. Por favor vuelva a intentarlo");
        }
    },
    delete: async(req: any, res: any)=>{
        try{
            //Busca que el producto esté en la base de datos
            const isInProducts = await productModel.findOne({name: req.body.name});
            //Busca que el producto esté en el carrito
            const isInCart = await cartModel.findOne({name: req.body.name});
            
            //En el caso que el producto esté en la base de datos
            if(isInProducts){
                //En el caso de que el producto esté en el carrito
                if(isInCart){
                    //En el caso de que haya solo una unidad del producto en el carrito
                    if(isInCart.amount == 1){
                        //Obtengo los datos de mi producto dentro del carrito
                        const product = isInCart;
                        //Declaro que no hay más unidades de este en el carrito
                        product.amount = 0;
                        //Al encontrar el nombre dentro del carrito, lo elimina
                        const deleteProduct = await cartModel.findOneAndDelete({name: req.body.name});
                        //Aumento el stock del producto dentro de la base de datos
                        isInProducts.stock=isInProducts.stock + 1;
                        //Guardo ese nuevo valor de stock en la base de datos
                        isInProducts.save();
                        //Le aviso que se ha eliminado del carrito
                        res.send("Se ha eliminado el producto '" +deleteProduct?.name+ "'del carrito.");
                    } else {
                        //En el caso de que haya más de una unidad del producto en el carrito
                        //Obtengo los datos de mi producto dentro del carrito
                        const product = isInCart;
                        //Disminuyo la cantidad de estos dentro del carrito
                        product.amount=product.amount-1;
                        //Aumento el stock del producto dentro de la base de datos
                        isInProducts.stock=isInProducts.stock+1;
                        //Guardo ese nuevo valor de stock en la base de datos
                        isInProducts.save();
                        //Guardo los nuevos datos dentro del carrito
                        product.save();
                        //Le aviso que se ha eliminado una unidad del carrito
                        res.send("Se ha eliminado una unidad de '" +isInProducts.name+ "'.\nLos datos del producto dentro del carrito ahora son:\n\n"+product);
                    }
                } else {
                    //En el caso de que el producto no esté en el carrito, le avisa
                    res.send("Lo siento, pero este producto no se encuentra actualmente en el carrito. \nPruebe agregarlo primero");
                }
            }else{
                //En el caso que el producto no esté en la base de datos
                res.send("Lo siento, pero este producto no está en nuestra selección");
            } 
        } 
        //En caso de algun error inesperado
        catch(error){
            res.send("Ha ocurrido un error. Por favor vuelva a intentarlo");
        }
    },
}

export default cartController;