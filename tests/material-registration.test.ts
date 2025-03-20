import { describe, it, expect, beforeEach } from "vitest"

// Mock the Clarity contract environment
const mockTxSender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
const mockBlockHeight = 100

// Mock contract state
let lastMaterialId = 0
const materials = new Map()

// Mock contract functions
const registerMaterial = (name, description, year, location, materialType, dimensions, condition) => {
  const newId = lastMaterialId + 1
  lastMaterialId = newId
  
  materials.set(newId, {
    owner: mockTxSender,
    name,
    description,
    year,
    location,
    "material-type": materialType,
    dimensions,
    condition,
    "registered-at": mockBlockHeight,
    verified: false,
  })
  
  return { ok: newId }
}

const getMaterial = (materialId) => {
  return materials.get(materialId)
}

const transferMaterial = (materialId, recipient) => {
  const material = materials.get(materialId)
  if (!material) {
    return { err: 404 }
  }
  
  if (material.owner !== mockTxSender) {
    return { err: 403 }
  }
  
  materials.set(materialId, {
    ...material,
    owner: recipient,
  })
  
  return { ok: true }
}

describe("Material Registration Contract", () => {
  beforeEach(() => {
    // Reset state before each test
    lastMaterialId = 0
    materials.clear()
  })
  
  it("should register a new material", () => {
    const result = registerMaterial(
        "Victorian Door",
        "Ornate wooden door from 1880s",
        1880,
        "Boston, MA",
        "Wood",
        '36" x 80" x 1.75"',
        "Good",
    )
    
    expect(result).toEqual({ ok: 1 })
    expect(materials.size).toBe(1)
    
    const material = getMaterial(1)
    expect(material).toBeDefined()
    expect(material.name).toBe("Victorian Door")
    expect(material.year).toBe(1880)
    expect(material["material-type"]).toBe("Wood")
    expect(material.verified).toBe(false)
  })
  
  it("should transfer material ownership", () => {
    // First register a material
    registerMaterial(
        "Stained Glass Window",
        "Art deco stained glass window",
        1925,
        "Chicago, IL",
        "Glass",
        '24" x 36"',
        "Excellent",
    )
    
    // Transfer to a new owner
    const newOwner = "ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    const result = transferMaterial(1, newOwner)
    
    expect(result).toEqual({ ok: true })
    
    const material = getMaterial(1)
    expect(material.owner).toBe(newOwner)
  })
  
  it("should fail to transfer if not the owner", () => {
    // First register a material
    registerMaterial(
        "Marble Column",
        "Corinthian marble column",
        1890,
        "New York, NY",
        "Stone",
        "12\" diameter x 8' height",
        "Fair",
    )
    
    // Change the sender to simulate a different user
    const originalSender = mockTxSender
    mockTxSender = "ST3PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    
    // Attempt to transfer
    const newOwner = "ST4PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    const result = transferMaterial(1, newOwner)
    
    expect(result).toEqual({ err: 403 })
    
    // Verify ownership hasn't changed
    const material = getMaterial(1)
    expect(material.owner).toBe(originalSender)
  })
})

