<script>
    import {show_notification, message} from '../../Stores/notification'
    export let customer_id
    let oldPassword = ""
    let newPassword = ""
    let confirmPassword = ""
    let showError = false
    let errorMessage = ""

    let disbaleBtn = false

    async function changePassword(){
        showError = false
        disbaleBtn = true
        
        if(oldPassword === "" || oldPassword.match(/^ *$/)){
            errorMessage = "Old password input field cannot be empty"
            showError = true
            disbaleBtn = false
            return
        }

        if(newPassword === "" || newPassword.match(/^ *$/)){
            errorMessage = "New password input field cannot be empty"
            showError = true
            disbaleBtn = false
            return
        }

        if(confirmPassword === "" || confirmPassword.match(/^ *$/)){
            errorMessage = "Confirm password input field cannot be empty"
            showError = true
            disbaleBtn = false
            return
        }

        if(newPassword != confirmPassword){
            errorMessage = "Confirm password does not match the new password"
            showError = true
            disbaleBtn = false
            return
        }
        if(confirm('Are you sure you want to save the changes ?')){
            const res = await fetch(`/api/customer/password/${customer_id}`, {
                method: 'PATCH', 
                headers: {
                    'Accept': 'application/json', 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newPassword: newPassword, 
                    oldPassword: oldPassword
                })
            })

            const result = await res.json()

            if(result.success){
                $message = "Successfully changed password. Redirecting you in 3s"
                $show_notification = true
                setTimeout(() => {
                    window.location.href = "/customer"
                }, 3000);
            }
            else{
                errorMessage = result.message
                showError = true
                disbaleBtn = false
                return
            }
        }
        

    }
</script>

<div class="grid grid-cols-1 justify-items-center max-w-screen-tablet mx-auto">
    <div class="divide-y divide-soli w-full">
        <h1 class="font-bold text-3xl text-center pb-3 tablet:text-4xl">Change Customer Password</h1>
        <p></p>
    </div>

    <div class="grid justify-items-center gap-4 mt-5">
        <div>
            <p class="pb-1 tablet:text-xl">Old Password</p>
            <input class="input outline outline-1 outline-blacked " bind:value={oldPassword} type="password"/>
        </div>
        
        <div>
            <p class="pb-1 tablet:text-xl">New Password</p>
            <input class="input outline outline-1 outline-blacked " bind:value={newPassword} type="password"/>
        </div>
    
        <div>
            <p class="pb-1 tablet:text-xl">Confirm Password</p>
            <input class="input outline outline-1 outline-blacked " bind:value={confirmPassword} type="password"/>
        </div>
    
        {#if showError}
            <p class="font-bold text-red-600 text-center">{errorMessage}</p>
        {/if}
        <div class="grid grid-cols-1 gap-4 tablet:grid-cols-2">
            <button class="btn btn-success shadow-lg" on:click={changePassword} disabled={disbaleBtn}>Save</button>
            <button class="btn btn-primary shadow-lg" on:click={()=>window.location.href = "/customer"}>Back</button>
        </div>
        
    
    </div>
</div>

