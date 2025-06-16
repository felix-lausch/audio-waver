float ndot(vec2 a, vec2 b ) { return a.x*b.x - a.y*b.y; }
float sdRhombus( in vec2 p, in vec2 b ) 
{
    p = abs(p);
    float h = clamp( ndot(b-2.0*p,b)/dot(b,b), -1.0, 1.0 );
    float d = length( p-0.5*b*vec2(1.0-h,1.0+h) );
    return d * sign( p.x*b.y + p.y*b.x - b.x*b.y );
}

vec3 pal( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*cos( 6.28318*(c*t+d) );
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy * 2.0 - 1.0;
    // Multiply by aspect ration to avoid stretching
    uv.x *= iResolution.x / iResolution.y;
    
    vec2 uv0 = uv;
    vec3 finalCol = vec3(0.0);
    
    for (float i = 0.0; i < 3.0; i++) {
        uv = fract(uv * 1.5) - 0.5;
    
        vec2 ra = 0.4 + 0.3*cos( iTime + vec2(0.0,1.57) + 0.0 );
        float d = sdRhombus(uv, ra) * exp(-sdRhombus(uv0, ra));

        vec3 col = pal( sdRhombus(uv0, ra) + iTime * 0.6 + i * 0.6, vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.0,0.10,0.20) );

        d = sin(d*8.0 + iTime) / 8.0;
        d = abs(d);
        d = smoothstep(0.0, 0.1, d);

        d = 0.2 / d;
        d = pow(d, 1.2);

        finalCol += col * d;
    }
 
    // Output to screen
    fragColor = vec4(finalCol, 1.0);
}