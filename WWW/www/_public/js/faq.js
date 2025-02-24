async function main(){
    let out = ''
    await fetch('/users/getfaqs')
    .then((res)=>{
        return res.json();
    })
    .then((qry)=>{
        console.log(qry);
        qry.value.forEach(q=>{
            out = out + `
                <div class="faq-q">${q.question}</div>
                <div class="faq-a">${q.answer}</div>
            `
        })
        document.getElementById('faqcontent').innerHTML = out;
        return;
    })
}
main()