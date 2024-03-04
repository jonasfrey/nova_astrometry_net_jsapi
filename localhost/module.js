
import { 
    ensureDir as f_ensure_folder
} from "https://deno.land/std@0.144.0/fs/mod.ts";

import {
    f_v_s__between,
    f_sleep_ms, 
    f_ddd
} from "https://deno.land/x/handyhelpers@3.6/mod.js" 
// should be https://deno.land/x/handyhelpers@3.6 but deno modules system had problems at the point of time i am writing this
// from "https://raw.githubusercontent.com/jonasfrey/handyhelpers/main/mod.js"

let o_config_and_cache = {
    n_ms_ts_ut_last_session_refresh : 0,
    n_ms_delta_max_until_refresh: 30*60*60*1000, 
    o_session: {
        status: '', 
        message: '', 
        session: ''
    },
}

let f_o_resp_fetch_nova_astronometry_net = async function(
    s_url, 
    o_data, 
){

    return fetch(
        s_url, 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
                // 'Content-Type': 'application/json'
            },
            body: 
            f_s_x_www_form_urlencoded(
                {
                    'request-json': o_data
                }
            )
        }
    )
}

function f_s_x_www_form_urlencoded(obj) {
    return Object.keys(obj).map(key => {
        const value = (typeof obj[key] === 'object') ? JSON.stringify(obj[key]) : obj[key];
        return encodeURIComponent(key) + '=' + encodeURIComponent(value);
    }).join('&');
}


let f_o_session = async function(
    s_api_key
){
    if(
        o_config_and_cache.n_ms_ts_ut_last_session_refresh == 0
        || Math.abs(new Date().getTime()-o_config_and_cache.n_ms_ts_ut_last_session_refresh) > o_config_and_cache.n_ms_delta_max_until_refresh
    ){
        let s_url_fetch = 'https://nova.astrometry.net/api/login'
        let o_resp = await f_o_resp_fetch_nova_astronometry_net(
            s_url_fetch, 
            {apikey: s_api_key}
        )
        if(!o_resp.ok){
            throw Error(
                JSON.stringify(
                    {
                        s_msg: 'when trying to fetch', 
                        s_url_fetch,
                        o_resp
                    }, null, 4
                )
            )
        }
        let o_data = await o_resp.json();
        if(o_data.status != 'success'){
            throw Error(
                JSON.stringify(
                    {
                        s_msg: 'when trying to login', 
                        s_url_fetch, 
                        o_data_response: o_data
                    }, null, 4
                )
            )
        }
        o_config_and_cache.n_ms_ts_ut_last_session_refresh = new Date().getTime();
        o_config_and_cache.o_session = o_data
    }
    return o_config_and_cache.o_session
}

let f_o_submission = async function(
    s_api_key, 
    o_data_request = {
        // session: s_session_nova_astronomy_net,//: string, requried. Your session key, required in all requests
        // url: s_url_image,//: string, required. The URL you want to submit to be solved
        // allow_commercial_use: "n",//: string: “d” (default), “y”, “n”: licensing terms
        // allow_modifications: "n",//: string: “d” (default), “y”, “n”, “sa” (share-alike): licensing terms
        // publicly_visible: 'n',//: string: “y”, “n”
        //  scale_units: 0,//: string: “degwidth” (default), “arcminwidth”, “arcsecperpix”. The units for the “scale_lower” and “scale_upper” arguments; becomes the “–scale-units” argument to “solve-field” on the server side.
        //  scale_type: 0,//: string, “ul” (default) or “ev”. Set “ul” if you are going to provide “scale_lower” and “scale_upper” arguments, or “ev” if you are going to provide “scale_est” (estimate) and “scale_err” (error percentage) arguments.
        //  scale_lower: 0,//: float. The lower-bound of the scale of the image.
        //  scale_upper: 0,//: float. The upper-bound of the scale of the image.
        //  scale_est: 0,//: float. The estimated scale of the image.
        //  scale_err: 0,//: float, 0 to 100. The error (percentage) on the estimated scale of the image.
        // center_ra: (s_ra) ? s_ra : null, 
        //o_image.o_target.n_degrees__right_ascension,//: float, 0 to 360, in degrees. The position of the center of the image.
        // center_dec: (s_dec) ? s_dec : null, 
        //o_image.o_target.n_degrees__declination,//: float, -90 to 90, in degrees. The position of the center of the image.
        // radius:  1,
        //(o_image?.o_instrument?.s_name == 'rila') ? 1 : 10, // (59.5*59.5 arcmin for rila),//: float, in degrees. Used with center_ra,``center_dec`` to specify that you know roughly where your image is on the sky.
        //  downsamplek_factor: 0,//: float, >1. Downsample (bin) your image by this factor before performing source detection. This often helps with saturated images, noisy images, and large images. 2 and 4 are commonly-useful values.
        //  tweak_order: 0,//: int. Polynomial degree (order) for distortion correction. Default is 2. Higher orders may produce totally bogus results (high-order polynomials are strange beasts).
        //  use_sextractor: 0,//: boolean. Use the SourceExtractor program to detect stars, not our built-in program.
        //  crpix_center: 0,//: boolean. Set the WCS reference position to be the center pixel in the image? By default the center is the center of the quadrangle of stars used to identify the image.
        //  parity: 0,//: int, 0, 1 or 2. Default 2 means “try both”. 0 means that the sign of the determinant of the WCS CD matrix is positive, 1 means negative. The short answer is, “try both and see which one works” if you are interested in using this option. It results in searching half as many matches so can be helpful speed-wise.
        //  image_width: 0,//: int, only necessary if you are submitting an “x,y list” of source positions.
        //  image_height: 0,//: int, ditto.
        //  positional_error: 0,//: float, expected error on the positions of stars in your image. Default is 1.
    }
){
        let o_session = await f_o_session(s_api_key);
        Object.assign(
            o_data_request, 
            {
                session: o_session.session
            }
        );

        let s_url_fetch = 'https://nova.astrometry.net/api/url_upload' 
        let o_resp = await f_o_resp_fetch_nova_astronometry_net(
            s_url_fetch,
            o_data_request
        );

        if(!o_resp.ok){
            throw Error(
                JSON.stringify(
                    {
                        s_msg: 'when trying to fetch', 
                        s_url_fetch, 
                        o_resp
                    }, null, 4
                )
            )
        }
        let o_data = await o_resp.json();
        if(o_data.status != 'success'){
            throw Error(
                JSON.stringify(
                    {
                        s_msg: 'when trying to login', 
                        s_url_fetch, 
                        o_data_request: o_data_request,
                        o_data_response: o_data
                    }, null, 4
                )
            )
        }
        return o_data // {status: "success", subid: 9325794 }
}


let f_o_submission_info = async function(
    s_api_key, 
    n_subid,
){
        let o_session = await f_o_session(s_api_key);

        let s_url_fetch = `https://nova.astrometry.net/api/submissions/${n_subid}`
        let o_resp = await f_o_resp_fetch_nova_astronometry_net(
            s_url_fetch,
            {
                session: o_session.session
            }
        );

        if(!o_resp.ok){
            throw Error(
                JSON.stringify(
                    {
                        s_msg: 'when trying to fetch', 
                        s_url_fetch, 
                        o_resp
                    }, null, 4
                )
            )
        }
        let o_data = await o_resp.json();

        return {
            n_subid: n_subid,
            ...o_data,
        }
}

let f_a_o_job_info = async function(
    s_api_key,
    n_subid
){
    let o_session = await f_o_session(s_api_key);
    let o_submission_info = await f_o_submission_info(s_api_key, n_subid);

    let a_o_job_result = await Promise.all(o_submission_info.jobs.map(
        async n_id_job =>{
            n_id_job = parseInt(n_id_job);
            if(typeof n_id_job != 'number'){
                return false;
            }
            let s_url_jobresult_info = `https://nova.astrometry.net/api/jobs/${n_id_job}/info/`
            let o_job_info = await (await f_o_resp_fetch_nova_astronometry_net(
                s_url_jobresult_info, 
                {
                    session: o_session.session
                }
            )).json();
            return {n_id_job: n_id_job, ...o_job_info}
        }
    ).filter(v=>v!==false));
    return a_o_job_result;
}

let f_a_o_job_result = async function(
    s_api_key,
    n_subid, 
    n_ms_interval_fetch = 10000,
    n_tries = 100,
    f_callback = (o_submission_info, a_o_job_info, n_try)=>{
        // console.log(`this is try ${n_try} of 100`)
        // console.log('the job has not yet started or at least one job is still in state "solving"...')
        // console.log(`trying again in 10 seconds...`)
        // console.log(
        //     {
        //         o_submission_info, 
        //         a_o_job_info
        //     }
        // )
    }
){

    let n_try_init = n_tries;
    let n_try = n_try_init;
    let o_submission_info = await f_o_submission_info(s_api_key, n_subid);
    let a_o_job_info = [];
    while(n_try > 0 ){
        n_try -=1;
        if(o_submission_info.jobs.filter(n=>typeof n == 'number').length == 0){
            o_submission_info = await f_o_submission_info(s_api_key, n_subid);
        }else{
            //processing has not started yet
            a_o_job_info = await f_a_o_job_info(s_api_key, n_subid);
            let a_o_job_info__solving = a_o_job_info.filter(o=>o.status == 'solving');
            // as long as there is at least one job solving we repeat...
            if(a_o_job_info.length != 0 && a_o_job_info__solving.length == 0){
                return a_o_job_info;
            }
        }
        f_callback(o_submission_info,a_o_job_info, n_try)
        await f_sleep_ms(n_ms_interval_fetch);
    }
    //'timeout'
    return a_o_job_info;
}


let f_o_platesolving_result = async function(
    s_api_key, 
    o_data_request = {
        url: 'https://i.ibb.co/VMhmXBV/m33-green.png'
    }, 
    n_ms_interval_fetch = 10000,
    n_tries = 100,
    f_callback = (a_o_job_info, n_try)=>{}
){

    let o_submission = await f_o_submission(
        s_api_key,
        o_data_request
    );
    let a_o_job_result = await f_a_o_job_result(
        s_api_key,
        o_submission.subid,
        n_ms_interval_fetch,
        n_tries,
        f_callback
    )
    return {
        o_submission, 
        a_o_job_result
    }

}

export {
    f_o_submission,
    f_o_session,
    o_config_and_cache,
    f_o_submission_info,
    f_a_o_job_info, 
    f_a_o_job_result, 
    f_o_platesolving_result
}
