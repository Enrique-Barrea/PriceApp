package pfg.priceapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LoginController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginData) {
        String userLogin = loginData.get("userLogin");
        String userPassword = loginData.get("userPassword");

        String sql = "{call dbo.Users_Login_Validation(?, ?)}";

        List<Map<String, Object>> users = jdbcTemplate.queryForList(
            sql,
            userLogin,
            userPassword
        );

        Map<String, Object> response = new HashMap<>();
        if (!users.isEmpty() && "Active".equals(users.get(0).get("UserStatus"))) {
            response.put("success", true);
            response.put("message", "Login exitoso");
            response.put("user", users.get(0));
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Credenciales incorrectas");
            return ResponseEntity.status(401).body(response);
        }
    }
}

