;; Material Registration Contract
;; Records details of salvaged architectural elements

(define-data-var last-material-id uint u0)

(define-map materials
  { material-id: uint }
  {
    owner: principal,
    name: (string-ascii 100),
    description: (string-ascii 500),
    year: uint,
    location: (string-ascii 100),
    material-type: (string-ascii 50),
    dimensions: (string-ascii 100),
    condition: (string-ascii 50),
    registered-at: uint,
    verified: bool
  }
)

(define-read-only (get-material (material-id uint))
  (map-get? materials { material-id: material-id })
)

(define-read-only (get-last-material-id)
  (var-get last-material-id)
)

(define-public (register-material
    (name (string-ascii 100))
    (description (string-ascii 500))
    (year uint)
    (location (string-ascii 100))
    (material-type (string-ascii 50))
    (dimensions (string-ascii 100))
    (condition (string-ascii 50))
  )
  (let
    (
      (new-id (+ (var-get last-material-id) u1))
    )
    (var-set last-material-id new-id)
    (map-set materials
      { material-id: new-id }
      {
        owner: tx-sender,
        name: name,
        description: description,
        year: year,
        location: location,
        material-type: material-type,
        dimensions: dimensions,
        condition: condition,
        registered-at: block-height,
        verified: false
      }
    )
    (ok new-id)
  )
)

(define-public (transfer-material (material-id uint) (recipient principal))
  (let
    (
      (material (unwrap! (map-get? materials { material-id: material-id }) (err u404)))
    )
    (asserts! (is-eq tx-sender (get owner material)) (err u403))
    (map-set materials
      { material-id: material-id }
      (merge material { owner: recipient })
    )
    (ok true)
  )
)

