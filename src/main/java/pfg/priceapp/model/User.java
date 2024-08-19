package pfg.priceapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id; // Add this import statement
import jakarta.persistence.Table;


@Entity
@Table(name = "Users")
public class User {

    @Id
    @Column(name = "UserIdNumber")
    private int userIdNumber;

    @Column(name = "UserLogin")
    private String userLogin;

    @Column(name = "UserPassword")
    private String userPassword;

}
