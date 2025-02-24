window.submitContactForm = async ()=>{
    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let subject = document.getElementById('subject').value;
    let description = document.getElementById('description').value;

    await fetch('/users/contactus', {
        method:'post',
        body: JSON.stringify({
            name:name,
            email:email,
            subject:subject,
            description:description,
        }),
        headers: {
            "Content-Type" : "application/json; charset=utf-8"
        }
    }).then((response)=>{
        return response.json();
    }).then((qry)=>{
        console.log(qry);
        if(qry.result=='ok'){
            
        }
    }).catch((err)=>{
        console.log(err);
    })
}

function main(){

}
main()