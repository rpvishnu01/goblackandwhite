function addToCart(productId){

    $.ajax({
        url:'/add-to-cart/'+productId,
        method:'get',
        success:(response)=>{
            if(response.status){
                // let count=$('#cart-count').html
                // count=parseInt(count)+1
                // $('#cart-count').load(`${location.href}#cart-count`)
                location.reload()
            }
        }
    })
}


function addToWishlist(productId){
    $.ajax({
        url:'/add-to-wishlist/'+productId,
        method:'get',
        success:(response)=>{
            console.log(response)
            if(response.status){
                // let count=$('#wishlist-count').html
                // count=parseInt(count)+1
                // $('#wishlist-count').load(`${location.href}#wishlist-count`)
                location.reload()
            }
        }
    })
}



