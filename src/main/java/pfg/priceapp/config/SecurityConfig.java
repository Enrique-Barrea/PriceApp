package pfg.priceapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @SuppressWarnings("deprecation")
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeRequests(requests -> requests
                        .antMatchers("/priceapp/login.html").permitAll()  // Permitir acceso a login.html sin autenticación
                        .anyRequest().authenticated()
                        .and()
                        .formLogin()
                        .loginPage("/priceapp/login.html")
                        .permitAll()
                        .and()
                        .logout()
                        .permitAll());
        return http.build();
    }
}
