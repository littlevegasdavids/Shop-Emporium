<script>
    import {cart_items} from '../../Stores/cart.js'
    
    let total = 0

    $:{
        total = 0
        $cart_items.forEach(item => {
            total += item.Product.price
        });

    }

</script>


{#if $cart_items.length != 0}
    <div class="mt-10 card card-compact dropdown-content w-52 bg-gray-200 shadow">
        <div class="card-body">
            <div class="divide-y-2 divide-solid divide-black tablet:text-lg">
                {#each $cart_items as item}
                    <div class="grid py-2">
                        <p>{item.Product.name}</p>
                        <p class="font-bold">R{item.Product.price}</p>
                    </div>
                {/each}
            </div>

            <span class="font-bold text-lg tablet:text-xl">Total: R{total}</span>
            <div class="card-actions">
                <button class="btn btn-primary shadow-lg" on:click={()=>window.location.href="/cart"}>View cart</button>
            </div>
        </div>
    </div>
{:else}
<div class="mt-10 card card-compact dropdown-content w-52 shadow bg-gray-200">
    <div class="card-body">
        <p>Cart is empty</p>
    </div>
</div>
{/if}