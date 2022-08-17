const {Router} = require('express')
const router = new Router()
const logger = require('../helpers/logger')
const prisma = require('../prisma/client')
const asyncHandler = require('express-async-handler')
const formidable = require('formidable')
const fileSystem = require('fs')
const path = require('path')

// *** Create ***

router.post('/', asyncHandler (async (req, res) =>{

    const form = formidable({})
    form.parse(req, async (err, fields, files)=>{
        if(err){
            logger.error(`Error encountered with creating product in formidable: ${err.message}`)
            return res.status(500).send('Internal server error')
        }

        const name = fields.name
        const price = parseInt(fields.price)

        if(isNaN(price)){
            return res.status(500).send('Invalid price format')
        }

        const description = fields.description
        let category = parseInt(fields.category)
        const new_category_bool = fields.new_category_bool
        const new_category_name = fields.new_category_name
        const dimension_height = fields.dimension_height
        const dimension_width = fields.dimension_width
        const dimension_length = fields.dimension_length

        const image1 = files.image1
        const image2 = files.image2
        const image3 = files.image3

        if(new_category_bool === "true"){
            let new_category = await prisma.product_Category.create({
                data:{
                    name: new_category_name
                }
            })

            category = new_category.id
        }

        
        const inventory = await prisma.product_Inventory.create({data:{}})

        const new_product = await prisma.product.create({
            data:{
                name:name,
                price:price,
                description: description, 
                category_id: category, 
                inventory_id: inventory.id,
                dimension_height: dimension_height, 
                dimension_length: dimension_length,
                dimension_width: dimension_width
            }
        })

        const new_product_id = String(new_product.id)

        fileSystem.mkdirSync(path.join(__dirname, "../", "public", "product_images", new_product_id), (err)=>{
            if(err){
                logger.error(`Error creating new directory for images id: ${new_product_id}`)
                return res.status(500).send('Internal Sever Error')
            }
        })
        
        var oldPath = image1.filepath
        var newPath = path.join(__dirname, "../", 'public', 'product_images', new_product_id) + "/" + "1.jpg"
        var rawData = fileSystem.readFileSync(oldPath)
        fileSystem.writeFileSync(newPath, rawData, function(err){
            if(err){
                logger.error(`Error creating new image 1 for id: ${new_product_id}`)
                return res.status(500).send('Internal Sever Error')
            }
        })

        oldPath = image2.filepath
        newPath = path.join(__dirname, "../", 'public', 'product_images', new_product_id) + "/" + "2.jpg"
        rawData = fileSystem.readFileSync(oldPath)
        fileSystem.writeFileSync(newPath, rawData, function(err){
            if(err){
                logger.error(`Error creating new image 2 for id: ${new_product_id}`)
                return res.status(500).send('Internal Sever Error')

            }
        })


        oldPath = image3.filepath
        newPath = path.join(__dirname, "../", 'public', 'product_images', new_product_id) + "/" + "3.jpg"
        rawData = fileSystem.readFileSync(oldPath)
        fileSystem.writeFileSync(newPath, rawData, function(err){
            if(err){
                logger.error(`Error creating new image 3 for id: ${new_product_id}`)
                return res.status(500).send('Internal Sever Error')

            }
        })
        logger.info(`Product API -- Created id: ${new_product_id}`)
        return res.redirect('/dashboard/products')
        
    })
}))

// *** Read ***
// Get By ID
router.get('/get/:id', asyncHandler (async (req, res)=>{
    const id = parseInt(req.params['id'])
    
    if(isNaN(id)){
        return res.status(400).json({success: false, message:"Invalid ID"})
    }
    
    const product = await prisma.Product.findUnique({   
        where:{
            id: id
        }, 
        include:{
            Product_Inventory: true
        }
    })

    if(product == null){
        return res.status(404).json({success: false, message: `Product does not exist with id: ${id}`})
    }

    return res.status(200).json({success: true, message: {product}})
}))

// Return all products that aren't sold
router.get('/notSold/all', asyncHandler (async(req, res)=>{
    const products = await prisma.Product.findMany({
        include:{
            Product_Category: true
        },
        where:{
            Product_Inventory:{
                sold: false
            }
        }
    })

    return res.status(200).json({success: true, message:{products}})
}))

// Return all products that aren't assigned to a category
router.get('/nullCategory', asyncHandler(async (req, res)=>{
    const products = await prisma.product.findMany({
        where:{
            category_id: null
        }
    })

    return res.status(200).json({success: true, products})
}))


// Returns true or false if the item is sold
router.get('/isSold/:id', asyncHandler(async(req, res)=>{
    const product_id = parseInt(req.params['id'])

    if(isNaN(product_id)){
        return res.status(400).json({success: false, message: 'ID invalid format'})
    }

    if(product_id === undefined){
        return res.status(400).json({success: false, message: 'Product ID not in req body'})
    }

    const product = await prisma.product.findUnique({
        where:{
            id: product_id
        }, 
        include: {
            Product_Inventory: true
        }
    })

    if(product === null){
        return res.status(404).json({success: false, message: `Cannot find product with id: ${product_id}`})
    }

    if(product.Product_Inventory.sold){
        return res.status(200).json({success: true, sold: true})
    }
    else{
        return res.status(200).json({success: true, sold: false})
    }
}))

// *** Update ***
router.post('/:id', asyncHandler (async (req, res)=>{
    const product_id = parseInt(req.params['id'])

    if(isNaN(product_id)){
        return res.status(400).json({success: false, message:"Invalid ID"})
    }

    const product = await prisma.product.findUnique({
        where:{
            id: product_id
        }, 
        include:{
            Product_Inventory: true
        }
    })

    if(product === null){
        return res.status(404).send(`Product with id: ${product_id} does not exist therefore cannot be updated`)
    }

    const form = formidable({})
    form.parse(req, async(err, fields, files)=>{
        if(err){
            logger.error(`Error encountered with creating product in formidable: ${err.message}`)
            return res.status(500).send('Internal server error')
        }

        const name = fields.name
        const price = parseInt(fields.price)

        if(isNaN(price)){
            return res.status(500).send('Invalid price format')
        }

        const description = fields.description
        let category = parseInt(fields.category)
        const dimension_height = fields.dimension_height
        const dimension_width = fields.dimension_width
        const dimension_length = fields.dimension_length
        let sold
        if(fields.sold === 'true'){
            sold = true
        }
        else{
            sold = false
        }

        const image1 = files.image1
        const image2 = files.image2
        const image3 = files.image3

        await prisma.product.update({
            data:{
                name:name,
                price:price,
                description: description, 
                category_id: category, 
                dimension_height: dimension_height, 
                dimension_length: dimension_length,
                dimension_width: dimension_width
            }, 
            where:{
                id: product_id
            }
        })

        await prisma.product_Inventory.update({
            data:{
                sold: sold
            }, 
            where:{
                id: product.Product_Inventory.id
            }
        })

        var oldPath
        var newPath
        var rawData

        if(image1.size != 0){
            oldPath = image1.filepath
            newPath = path.join(__dirname, "../", 'public', 'product_images', String(product_id)) + "/" + "1.jpg"
            rawData = fileSystem.readFileSync(oldPath)
            fileSystem.writeFileSync(newPath, rawData, function(err){
                if(err){
                    logger.error(`Error creating new image 1 for id: ${product_id}`)
                    return res.status(500).send('Internal Sever Error')
                }
            })
        }
        
        if(image2.size != 0){
            oldPath = image2.filepath
            newPath = path.join(__dirname, "../", 'public', 'product_images', String(product_id)) + "/" + "2.jpg"
            rawData = fileSystem.readFileSync(oldPath)
            fileSystem.writeFileSync(newPath, rawData, function(err){
                if(err){
                    logger.error(`Error creating new image 2 for id: ${product_id}`)
                    return res.status(500).send('Internal Sever Error')
    
                }
            })
        }
        
        if(image3.size != 0){
            oldPath = image3.filepath
            newPath = path.join(__dirname, "../", 'public', 'product_images', String(product_id)) + "/" + "3.jpg"
            rawData = fileSystem.readFileSync(oldPath)
            fileSystem.writeFileSync(newPath, rawData, function(err){
                if(err){
                    logger.error(`Error creating new image 3 for id: ${product_id}`)
                    return res.status(500).send('Internal Sever Error')
    
                }
            })
        }
        
        logger.info(`Product API -- Edit id: ${product_id}`)
        return res.redirect('/dashboard/products')
    })
}))

router.patch('/assignCategory/:id', asyncHandler(async(req, res)=>{
    const product_id = parseInt(req.params['id'])
    

    if(req.body.category_id === undefined){
        return res.status(400).json({success: false, message: "Category ID not in req body"})
    }

    const category_id = parseInt(req.body.category_id)

    if(isNaN(category_id)){
        return res.status(400).json({success: false, message: "Category ID invalid format"})
    }

    if(isNaN(product_id)){
        return res.status(400).json({success: false, message:"Invalid ID"})
    }

    const product = await prisma.product.findUnique({
        where:{
            id: product_id
        }, 
        include:{
            Product_Inventory: true
        }
    })

    if(product === null){
        return res.status(404).send(`Product with id: ${product_id} does not exist therefore cannot be updated`)
    }

    await prisma.product.update({
        where:{
            id: product_id
        }, 
        data:{
            category_id: category_id
        }
    })

    return res.status(200).json({success: true})
}))

// *** Delete ***
router.delete('/:id', asyncHandler (async (req, res)=>{
    const id = parseInt(req.params['id'])

    if(isNaN(id)){
        return res.status(400).json({success: false, message:"Invalid ID"})
    }

    const temp = await prisma.product.findUnique({
        where:{
            id: id
        }
    })

    if(temp === null){
        return res.status(400).json({success: false, message: `Product does not exist with id: ${id}`})
    }

    await prisma.Product.delete({
        where:{
            id: id
        }
    })

    const image_dir = path.join(__dirname, "../", "public", "product_images", String(id))

    fileSystem.rm(image_dir, {recursive: true},(err)=>{
        if(err){
            logger.error(`Error deleting product ${id} image directory`)
        }
    })

    logger.info(`Product API -- Deleted id: ${id}`)

    return res.status(200).json({success: true, message: `Product successfully deleted id: ${id}`})
}))

// All
router.get('/all', asyncHandler (async (req, res)=>{
    const products = await prisma.Product.findMany({
        include:{
            Product_Inventory: true
        }, 
        orderBy:{
            created_at: "desc"
        }
    })

    return res.status(200).json({success: true, message:{products}})
}))


module.exports = router