let f_v = async function(n_input){
    return new Promise(
        (f_res)=>{
            window.setTimeout(function(){
                return f_res(n_input)
            },Math.random()*1000)
        }
    )
}

let f_o__fetch = async function(n_input){
    let o = await fetch('https://deno.land/');
    return o;
}
let v = await f_v(112);
console.log(v)

let a_o = Promise.all(
    [
        f_v(1).then(v=>{console.log(`finished ${v}`); return v}),
        f_v(2).then(v=>{console.log(`finished ${v}`); return v}),
        f_v(3).then(v=>{console.log(`finished ${v}`); return v}),
    ]
).then(a_v =>{console.log(`finished all ${a_v}`)})


let a_o2 = Promise.all(
    new Array(10)
    .fill(0)    
    .map((n, n_idx)=>{
       return f_v(n_idx).then(v=>{console.log(`n_idx: ${n_idx} finished ${v}`); return v})
    })
).then(a_v =>{console.log(`finished all ${a_v}`)})


let a_o3 = Promise.all(
    new Array(10)
    .fill(0)    
    .map((n, n_idx)=>{
       return f_o__fetch(n_idx).then(v=>{console.log(`n_idx: ${n_idx} finished ${v}`); return v})
    })
).then(a_v =>{console.log(`finished all ${a_v}`)})
