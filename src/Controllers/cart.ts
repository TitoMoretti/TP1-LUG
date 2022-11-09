import express, { Request, Response } from 'express';
import cartModel from "../Models/cart"
import productModel from "../Models/products"
import detailsModel from "../Models/cartdetails"

const cartController = {
    get: async (req: any, res: any) =>{
        try
        {
            //Obtiene los datos del carrito y sus detalles dentro
            const CartDetails = await detailsModel.findOne();
            const Cart = await cartModel.findOne();
            //En el caso de que haya productos en el carrito (no hay detalles)
            if(!CartDetails) {
                const miCart = await cartModel.find();
                res.send("Actualmente su carrito está vacio.\nPruebe agragar algún producto.");
            } else {
                if (Cart) {
                    //Establezco variables
                    let i, precioTotal=0, precio=0, cantidad=0;
                    //Busca todos los detalles que están en el carrito
                    const cart = await detailsModel.find();
                    //Se fija por todo el carrito y se ven los datos que tiene
                    for (i=0; i < cart.length; i++)
                    {
                        //Se obtiene el precio de cada producto
                        precio = cart[i].price;
                        //Se obtiene la cantidad de productos que se han agregado
                        cantidad = cantidad + cart[i].amount;
                        let cantPrecio= cart[i].amount;
                        //Se calcula el precio total de todos los productos que están en el carrito
                        precioTotal = precioTotal + (cantPrecio*precio);
                    }
                    //Me aseguro de encontrar mi carrito
                    const miCart = await cartModel.findOne();
                    if(miCart){
                        //Actualizo este con los detalles calculados anteriormente
                        miCart.totalPrice = precioTotal;
                        miCart.details[0] = "Cantidad de productos agregados: "+cantidad;
                        //Guardo los nuevos datos
                        miCart.save();
                    }
                    //Le informa los datos que tendrá el carrito, junto al precio total de todo
                    res.status(200).send("Su carrito actualmente está conformado de los siguientes datos:\n\n" +miCart?.details[0]+"\nPrecio Total: "+miCart?.totalPrice)
                } else {
                    //En el caso de que no haya productos en el carrito         
                    res.send("Actualmente su carrito está vacio.\nPruebe agragar algún producto.")
                }
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
            //Primero me fijo si hay un carrito creado
            const cart = await cartModel.findOne()
            if (!cart) {
                //En caso de que no exista, lo crea
                const newCart = new cartModel({name: "Carrito", details: [], totalPrice: 0})
                await newCart.save()
            }
            //Busca que el producto esté en la base de datos
            const isInProducts = await productModel.findOne({name: req.body.name})
            //Busca que el producto esté en el carrito
            const isInCartDetails = await detailsModel.findOne({name: req.body.name})
            
            //En el caso que el producto insertado esté en la base de datos
            if(isInProducts){
                //Se fija si hay stock del producto. En el caso de que haya stock
                if(isInProducts.stock >= 1) {
                    //En el caso de que no haya detalles del producto en el carrito
                    if(!isInCartDetails){
                        //Tomo los detalles del producto
                        const newProductInCart = new detailsModel({name: isInProducts.name, amount: 1, price: isInProducts.price});            
                        //Disminuyo el stock que tiene
                        isInProducts.stock=isInProducts.stock-1;          
                        //Guardo los detalles del producto a la base de datos
                        newProductInCart.save();
                        //Guardo el cambio del stock en la base de datos
                        isInProducts.save();
                        //Encuentro los detalles y el carrito
                        const cartDetails = await detailsModel.find()
                        const miCart = await cartModel.findOne()
                        //Eliminaré el array "details" que tengo en mi carrito
                        await miCart?.details.splice(0,miCart.details.length)
                        //Actualizaré el array anterior con los nuevos detalles
                        await miCart?.details.push(cartDetails)
                        //Guardos estos cambios en mi carrito
                        await miCart?.save()
                        //Le aviso que el producto se agregó al carrito
                        res.send("Se ha podido agregar un '" +newProductInCart.name+ "' al carrito con éxito!\nLos datos del producto dentro del carrito ahora son:\n\nNombre: "+newProductInCart.name+"\nCantidad: "+newProductInCart.amount+"\nPrecio c/u: "+newProductInCart.price);
                    } else {
                        //En el caso de que el producto esté en el carrito
                        //Tomos los valores del producto que está en el carrito
                        const product = isInCartDetails;
                        //Aumento la cantidad de unidades del mismo dentro del carrito
                        product.amount=product.amount+1;
                        //Disminuyo el stock que tiene
                        isInProducts.stock=isInProducts.stock-1;
                        //Guardo los cambios en la base de datos
                        isInProducts.save();
                        product.save();
                        //Encuentro los detalles y el carrito
                        const cartDetails = await detailsModel.find()
                        const miCart = await cartModel.findOne()
                        //Eliminaré el array "details" que tengo en mi carrito
                        await miCart?.details.splice(0,miCart.details.length)
                        //Actualizaré el array anterior con los nuevos detalles
                        await miCart?.details.push(cartDetails)
                        //Guardos estos cambios en mi carrito
                        await miCart?.save()
                        //Le aviso que se agregó otra unidad
                        res.send("Se ha agregado una unidad adicional de '" +isInProducts.name+ "'.\nLos datos del producto dentro del carrito ahora son:\n\nNombre: "+product.name+"\nCantidad: "+product.amount+"\nPrecio c/u: "+product.price);
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
            //Busca que los detalles del producto esté en el carrito
            const isInCart = await detailsModel.findOne({name: req.body.name});
            
            //En el caso que el producto esté en la base de datos
            if(isInProducts){
                //En el caso de que el producto esté en el carrito
                if(isInCart){
                    //En el caso de que haya solo una unidad del producto en el carrito
                    if(isInCart.amount == 1) {
                        //Obtengo los datos de mi producto dentro del carrito
                        const product = isInCart;
                        //Declaro que no hay más unidades de este en el carrito
                        product.amount = 0;
                        //Al encontrar el nombre dentro del carrito, lo elimina
                        const deleteProduct = await detailsModel.findOneAndDelete({name: req.body.name});
                        //Aumento el stock del producto dentro de la base de datos
                        isInProducts.stock=isInProducts.stock + 1;
                        //Guardo ese nuevo valor de stock en la base de datos
                        isInProducts.save();
                        //Encuentro los detalles y el carrito
                        const cartDetails = await detailsModel.find()
                        const miCart = await cartModel.findOne()
                        //Eliminaré el array "details" que tengo en mi carrito
                        await miCart?.details.splice(0,miCart.details.length)
                        //Actualizaré el array anterior con los nuevos detalles
                        await miCart?.details.push(cartDetails)
                        //Guardos estos cambios en mi carrito
                        await miCart?.save()
                        //Le aviso que se ha eliminado del carrito
                        res.send("Se ha eliminado el producto '" +deleteProduct?.name+ "' totalmente del carrito.");
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
                        //Encuentro los detalles y el carrito
                        const cartDetails = await detailsModel.find()
                        const miCart = await cartModel.findOne()
                        //Eliminaré el array "details" que tengo en mi carrito
                        await miCart?.details.splice(0,miCart.details.length)
                        //Actualizaré el array anterior con los nuevos detalles
                        await miCart?.details.push(cartDetails)
                        //Guardos estos cambios en mi carrito
                        await miCart?.save()
                        //Le aviso que se ha eliminado una unidad del carrito
                        res.send("Se ha eliminado una unidad de '" +isInProducts.name+ "'.\nLos datos del producto dentro del carrito ahora son:\n\nNombre: "+product.name+"\nCantidad: "+product.amount+"\nPrecio c/u: "+product.price);
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