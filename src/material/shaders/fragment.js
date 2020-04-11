/**
 * Implement fragment shader for our particles.
 * Author: Ronen Ness.
 * Since: 2019.
 */

 // "Cuts" a circle out of the default square shape
// by setting the "leftovers" as transparent
const circleParticleShape = `
    float r = 0.0, delta = 0.0, alpha = 1.0;
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    r = dot(cxy, cxy);
    if (r > 1.0) {
        discard;
    }
`;

export default `
// material uniforms
uniform vec3 globalColor;

// params we get from vertex shader
varying float vAlpha;

// per-particle color from vertex shader
#ifdef COLORING
    varying vec3 vColor;
#endif

// per-particle rotation from vertex shader
#ifdef ROTATION
    varying float vRotation;
#endif

// diffuse texture
#ifdef TEXTURE
    uniform sampler2D texture;
#endif


// fragment shader main
void main() 
{
    #ifdef ROUND_SHAPE
        float r = 0.0, delta = 0.0, alpha = 1.0;
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        r = dot(cxy, cxy);
        if (r > 1.0) {
            discard;
        }
    #endif

    // set default color if don't have per-particle colors
    #ifndef COLORING
        vec3 vColor = vec3(1,1,1);
    #endif

    // texture
    #ifdef TEXTURE

        // use rotation (rotate texture)
        #ifdef ROTATION
            float mid = 0.5;
            vec2 rotated = vec2(cos(vRotation) * (gl_PointCoord.x - mid) + sin(vRotation) * (gl_PointCoord.y - mid) + mid,
                          cos(vRotation) * (gl_PointCoord.y - mid) - sin(vRotation) * (gl_PointCoord.x - mid) + mid);
            vec4 texture = texture2D(texture,  rotated);
        // no rotation
        #else
            vec2 coords = vec2((gl_PointCoord.x - 0.5) + 0.5, (gl_PointCoord.y - 0.5) + 0.5);
            vec4 texture = texture2D(texture, coords);
        #endif

        // get color with texture
        gl_FragColor = vec4( globalColor * vColor, vAlpha ) * texture;
        
    // no texture (colors only)
    #else
        gl_FragColor = vec4( globalColor * vColor, vAlpha );
    #endif

    // check if need to discard pixel
    #ifdef ALPHA_TEST
        if (gl_FragColor.a < 0.00001) { discard; }
    #endif
}
`;
