## legsilatures

- id
- nom
- date_start
- date_end

## deputés

- même info sur candidat
- id_groupe (one to many)
- id_comission (many-to-many)

## groupe

- nom
- logo

## commission

- nom
- desciption
- ..

## commission_bureau

- role
- comission
- deputy
