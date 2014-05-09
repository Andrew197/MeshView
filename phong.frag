    precision mediump float;

    varying vec2 vTextureCoord;
    varying vec3 vTransformedNormal;
    varying vec4 vPosition;

    uniform vec3 uPointLightingLocation;
    uniform sampler2D uSampler;


    void main(void) 
    {
        vec3 lightWeighting;
        vec3 AmbientColor = vec3(0.0,0.0,0.0);
        vec3 uPointLightingDiffuseColor = vec3(0.8,0.8,0.8);
        vec3 uPointLightingSpecularColor = vec3(0.8,0.8,0.8);
        float uMaterialShininess = 32.0;
        
        vec3 lightDirection = normalize(uPointLightingLocation - vPosition.xyz);
        vec3 normal = normalize(vTransformedNormal);

        float specularLightWeighting = 0.0;

        //specular highlight
        vec3 eyeDirection = normalize(-vPosition.xyz);
        vec3 reflectionDirection = reflect(-lightDirection, normal);

        specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uMaterialShininess);
    

        float diffuseLightWeighting = max(dot(normal, lightDirection), 0.0);
        lightWeighting = AmbientColor
            + uPointLightingSpecularColor * specularLightWeighting
            + uPointLightingDiffuseColor * diffuseLightWeighting;

        vec4 fragmentColor;
        fragmentColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
        //else fragmentColor = vec4(1.0, 1.0, 1.0, 1.0);
        gl_FragColor = vec4(fragmentColor.rgb * lightWeighting, fragmentColor.a);
    }