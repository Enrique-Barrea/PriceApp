package pfg.priceapp.model;

import javax.persistence.*;

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
