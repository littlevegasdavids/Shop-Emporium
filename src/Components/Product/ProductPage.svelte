<script>
    import { onMount } from "svelte";
    import AddToCartBtn from '../Cart/AddToCartBtn.svelte'
    import {Link} from 'svelte-routing'
    import Loading from '../Loading.svelte'
    export let product_id;
    let loading = true
    let product
    let other_products
    let sold

    let mainImageSrc = '1'
    let image1Css = 'outline outline-3 outline-black rounded-md shadow-lg'
    let image2Css = 'outline outline-1 outline-black rounded-md shadow-lg'
    let image3Css = 'outline outline-1 outline-black rounded-md shadow-lg'

    onMount(async ()=>{
        const prod_res = await fetch(`/api/product/get/${product_id}`)
        const prod_result = await prod_res.json()
        if(prod_result.success){
            product = prod_result.message.product
            sold = prod_result.message.product.sold

            const other_prod_res = await fetch(`/api/category/get/${product.category_id}`)
            const other_prod_result = await other_prod_res.json()

            console.log(product.dimension_height)

            if(other_prod_result.success){
                other_products = other_prod_result.message.category.Product
                other_products = other_products.filter(p =>{
                    if(p.id != product_id){
                        return p
                    }
                })
                loading = false
            }
            else{
                console.log(other_prod_result.message)
                alert('Something went wrong getting product information')
            }
        }
        else{
            console.log(prod_result.message)
            alert('Something went wrong getting product information')
        }
        
    })

    function changeMainImage(id){
        mainImageSrc = id
        if(id === 1){
            image1Css = 'outline outline-3 outline-black cursor-pointer rounded-md shadow-lg'
            image2Css = 'outline outline-1 outline-black cursor-pointer rounded-md shadow-lg'
            image3Css = 'outline outline-1 outline-black cursor-pointer rounded-md shadow-lg'
        }
        else if(id === 2){
            image1Css = 'outline outline-1 outline-black cursor-pointer rounded-md shadow-lg'
            image2Css = 'outline outline-2 outline-black cursor-pointer rounded-md shadow-lg'
            image3Css = 'outline outline-1 outline-black cursor-pointer rounded-md shadow-lg'
        }
        else{
            image1Css = 'outline outline-1 outline-black cursor-pointer rounded-md shadow-lg'
            image2Css = 'outline outline-1 outline-black cursor-pointer rounded-md shadow-lg'
            image3Css = 'outline outline-3 outline-black cursor-pointer rounded-md shadow-lg'
        }
    }
</script>

{#if loading}
    <Loading />
{:else}
    <div class="grid bg-gray-100 p-4 rounded-3xl shadow-xl gap-4 text-center outline outline-1 outline-black browser:grid-cols-2">
        <div class="grid justify-items-center">
            <a href="/product_images/{product_id}/{mainImageSrc}.jpg" target="_blank" class="" rel="noreferrer">
                <img src="/product_images/{product_id}/{mainImageSrc}.jpg" alt="{product.name} - image" class="rounded-xl shadow-lg" height="600" width="450" id="displayImage"/>
            </a>
            <div class="grid grid-cols-3 gap-3 pt-5">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <img src ="/product_images/{product_id}/1.jpg" alt="{product.name} - image 1" height="60" width="45" class={image1Css} on:click={()=>changeMainImage(1)} id="image1"/>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <img src ="/product_images/{product_id}/2.jpg" alt="{product.name} - image 1" height="60" width="45" class={image2Css} on:click={()=>changeMainImage(2)} id="image2"/>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <img src ="/product_images/{product_id}/3.jpg" alt="{product.name} - image 1" height= "60" width="45" class={image3Css} on:click={()=>changeMainImage(3)} id="image3"/>
            </div>
        </div>
        <div class="my-auto">
            <div class="pb-3">
                <p class="font-bold text-3xl pb-3 tablet:text-4xl">{product.name}</p>
                <p class="font-bold text-xl">R{product.price}</p>
            </div>
            <div class="grid gap-4">
                {#if !sold}
                    <AddToCartBtn product_id={product.id} product_name={product.name} extraCss={"tablet:w-8/12 mx-auto"}/>
                {:else}
                    <button class="btn shadow-lg tablet:w-8/12 mx-auto">Sold</button>
                {/if}
                <button class="btn btn-secondary shadow-lg tablet:w-8/12 mx-auto" on:click={()=>{window.location.href="/products"}}>Back To Product Page</button>
                <div class="grid gap-2">
                    <p class="font-bold pt-3 tablet:text-2xl">Description</p>
                    <p class="tablet:text-xl">{product.description}</p>
                </div>
                <div class="grid">
                    <p class="font-bold pt-3 tablet:text-2xl">Dimensions</p>
                    {#if product.dimension_height != null}
                        <p class="tablet:text-xl">Height: {product.dimension_height}</p>
                    {/if}

                    {#if product.dimension_length != null}
                        <p class="tablet:text-xl">Length: {product.dimension_length}</p>
                    {/if}

                    {#if product.dimension_width != null}
                        <p class="tablet:text-xl">Width: {product.dimension_width}</p>
                    {/if}
                </div>
            </div>
        </div>
    </div>
    {#if other_products.length != 0}
        <div class="grid justify-items-center mt-5">
            <p class="font-bold text-3xl pb-3">You may also like</p>
            <div class="grid grid-cols-3 gap-3 text-center browser:grid-cols-4">
                {#each other_products as other}
                    <div class="grid grid-cols-1 bg-base-300 p-3 rounded-2xl shadow-lg browser:hover:bg-primary">
                        <Link to="/product/{other.id}">
                            <img src="/product_images/{other.id}/1.jpg" alt={other.name + " - image"} class="rounded-lg" height="400" width="300"/>
                        </Link>
                        <p class="font-bold pt-1">{other.name}</p>
                        <p class="">R{other.price}</p>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
{/if}
