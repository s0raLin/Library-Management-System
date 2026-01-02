package com.cangli.pojo;

public class Reader {
    private Long id;
    private String name;
    private String gender;
    private String classDept;
    private String readerType;
    private String contact;
    private Integer borrowLimit = 3;
    private Integer borrowedCount = 0;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getClassDept() { return classDept; }
    public void setClassDept(String classDept) { this.classDept = classDept; }

    public String getReaderType() { return readerType; }
    public void setReaderType(String readerType) { this.readerType = readerType; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }

    public Integer getBorrowLimit() { return borrowLimit; }
    public void setBorrowLimit(Integer borrowLimit) { this.borrowLimit = borrowLimit; }

    public Integer getBorrowedCount() { return borrowedCount; }
    public void setBorrowedCount(Integer borrowedCount) { this.borrowedCount = borrowedCount; }
}